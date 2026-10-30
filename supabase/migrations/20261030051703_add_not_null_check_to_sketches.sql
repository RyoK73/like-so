SET lock_timeout = '5s';

ALTER TABLE public.sketches
	ALTER COLUMN updated_at SET NOT NULL,
	ALTER COLUMN created_at SET NOT NULL,
	ALTER COLUMN description SET DEFAULT '',
	ALTER COLUMN description SET NOT NULL;
