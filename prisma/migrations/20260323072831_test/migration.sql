-- CreateTable
CREATE TABLE "tbl_common_api" (
    "api_id" SERIAL NOT NULL,
    "api_type" VARCHAR(10) NOT NULL,
    "api_name" VARCHAR(300) NOT NULL,
    "api_path" VARCHAR(300) NOT NULL,
    "api_function" VARCHAR(100) NOT NULL,
    "auth_flag" VARCHAR(2) NOT NULL,
    "api_remark" VARCHAR(30) NOT NULL,
    "state" VARCHAR(5) NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tbl_common_api_pkey" PRIMARY KEY ("api_id")
);

-- CreateTable
CREATE TABLE "tbl_common_user" (
    "user_id" VARCHAR(100) NOT NULL,
    "user_username" VARCHAR(100) NOT NULL DEFAULT '',
    "user_type" VARCHAR(10) NOT NULL,
    "user_email" VARCHAR(100) NOT NULL DEFAULT '',
    "user_country_code" VARCHAR(5) NOT NULL DEFAULT '',
    "user_phone" VARCHAR(20) NOT NULL DEFAULT '',
    "user_discord" VARCHAR(50) NOT NULL DEFAULT '',
    "user_telegram" VARCHAR(50) NOT NULL DEFAULT '',
    "user_account" VARCHAR(100) NOT NULL DEFAULT '',
    "user_password" VARCHAR(100) NOT NULL,
    "user_password_error" INTEGER NOT NULL,
    "user_login_time" TIMESTAMP(3),
    "user_name" VARCHAR(100) NOT NULL DEFAULT '',
    "user_gender" VARCHAR(1) NOT NULL DEFAULT '',
    "user_avatar" VARCHAR(200) NOT NULL DEFAULT '',
    "user_province" VARCHAR(20) NOT NULL DEFAULT '',
    "user_city" VARCHAR(20) NOT NULL DEFAULT '',
    "user_district" VARCHAR(20) NOT NULL DEFAULT '',
    "user_address" VARCHAR(100) NOT NULL DEFAULT '',
    "user_zipcode" VARCHAR(20) NOT NULL DEFAULT '',
    "user_company" VARCHAR(200) NOT NULL DEFAULT '',
    "user_remark" VARCHAR(200) NOT NULL DEFAULT '',
    "state" VARCHAR(5) NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tbl_common_user_pkey" PRIMARY KEY ("user_id")
);
