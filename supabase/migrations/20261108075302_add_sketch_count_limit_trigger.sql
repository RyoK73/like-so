SET lock_timeout = '5s';

CREATE FUNCTION public.sketches_enforce_count_limit()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY INVOKER
AS $$
DECLARE
  max_count CONSTANT integer := 20;
  current_count integer;
BEGIN
  PERFORM pg_advisory_xact_lock(
    ('x' || substr(md5('sketches:' || NEW.user_id::text), 1, 16))::bit(64)::bigint
  );

  IF EXISTS (
    SELECT 1 FROM public.sketches
    WHERE id = NEW.id AND user_id = NEW.user_id
  ) THEN
    RETURN NEW;
  END IF;

  SELECT count(*)
    INTO current_count
    FROM public.sketches
    WHERE user_id = NEW.user_id;

  IF current_count >= max_count THEN
    RAISE EXCEPTION 'sketch count limit reached'
      USING ERRCODE = 'SK001';
  END IF;

  RETURN NEW;
END
$$;

CREATE TRIGGER sketches_enforce_count_limit
BEFORE INSERT
ON public.sketches
FOR EACH ROW
EXECUTE FUNCTION public.sketches_enforce_count_limit();
