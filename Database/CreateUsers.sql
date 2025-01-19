CREATE TABLE IF NOT EXISTS public."AspNetUsers"
(
    "Id" text COLLATE pg_catalog."default" NOT NULL,
    "FirstName" text COLLATE pg_catalog."default",
    "LastName" text COLLATE pg_catalog."default",
    "DateOfBirth" timestamp with time zone NOT NULL,
    "Gender" text COLLATE pg_catalog."default",
    "Address" text COLLATE pg_catalog."default",
    "City" text COLLATE pg_catalog."default",
    "Country" text COLLATE pg_catalog."default",
    "PostCode" text COLLATE pg_catalog."default",
    "Email" character varying(256) COLLATE pg_catalog."default" NOT NULL,
    "Role" text COLLATE pg_catalog."default",
    "UserName" character varying(256) COLLATE pg_catalog."default",
    "NormalizedUserName" character varying(256) COLLATE pg_catalog."default",
    "NormalizedEmail" character varying(256) COLLATE pg_catalog."default",
    "EmailConfirmed" boolean NOT NULL,
    "PasswordHash" text COLLATE pg_catalog."default",
    "SecurityStamp" text COLLATE pg_catalog."default",
    "ConcurrencyStamp" text COLLATE pg_catalog."default",
    "PhoneNumber" text COLLATE pg_catalog."default",
    "PhoneNumberConfirmed" boolean NOT NULL,
    "TwoFactorEnabled" boolean NOT NULL,
    "LockoutEnd" timestamp with time zone,
    "LockoutEnabled" boolean NOT NULL,
    "AccessFailedCount" integer NOT NULL,
    CONSTRAINT "PK_AspNetUsers" PRIMARY KEY ("Id")
)

TABLESPACE pg_default;

ALTER TABLE public."AspNetUsers"
    OWNER to pratyushad;

-- Index: public.EmailIndex
CREATE INDEX IF NOT EXISTS "EmailIndex"
    ON public."AspNetUsers" USING btree
    ("""NormalizedEmail""" COLLATE pg_catalog."default" ASC NULLS LAST)
    TABLESPACE pg_default;
-- Index: public.IX_AspNetUsers_Email
CREATE UNIQUE INDEX IF NOT EXISTS "IX_AspNetUsers_Email"
    ON public."AspNetUsers" USING btree
    ("""Email""" COLLATE pg_catalog."default" ASC NULLS LAST)
    TABLESPACE pg_default;
-- Index: public.UserNameIndex
CREATE UNIQUE INDEX IF NOT EXISTS "UserNameIndex"
    ON public."AspNetUsers" USING btree
    ("""NormalizedUserName""" COLLATE pg_catalog."default" ASC NULLS LAST)
    TABLESPACE pg_default;