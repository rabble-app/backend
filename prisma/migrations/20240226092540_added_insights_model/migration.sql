-- CreateTable
CREATE TABLE "nwro" (
    "id" STRING NOT NULL,
    "week" INT4 NOT NULL,
    "year" INT4 NOT NULL,
    "value" DECIMAL(65,30) NOT NULL DEFAULT 0.0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "nwro_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "unique_users" (
    "id" STRING NOT NULL,
    "week" INT4 NOT NULL,
    "year" INT4 NOT NULL,
    "value" DECIMAL(65,30) NOT NULL DEFAULT 0.0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "unique_users_pkey" PRIMARY KEY ("id")
);
