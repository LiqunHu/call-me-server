-- CreateTable
CREATE TABLE "tbl_common_api" (
    "api_id" SERIAL NOT NULL,
    "api_type" VARCHAR(10) NOT NULL DEFAULT '',
    "api_name" VARCHAR(300) NOT NULL DEFAULT '',
    "api_path" VARCHAR(300) NOT NULL DEFAULT '',
    "api_function" VARCHAR(100) NOT NULL DEFAULT '',
    "auth_flag" VARCHAR(2) NOT NULL DEFAULT '1',
    "api_remark" VARCHAR(30) NOT NULL DEFAULT '',
    "state" VARCHAR(5) NOT NULL DEFAULT '1',
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tbl_common_api_pkey" PRIMARY KEY ("api_id")
);

-- CreateTable
CREATE TABLE "tbl_common_group" (
    "group_id" SERIAL NOT NULL,
    "group_type" VARCHAR(3) NOT NULL DEFAULT '',
    "group_code" VARCHAR(20) NOT NULL DEFAULT '',
    "group_name" VARCHAR(50) NOT NULL DEFAULT '',
    "node_type" VARCHAR(2) NOT NULL DEFAULT '',
    "parent_id" VARCHAR(30) NOT NULL DEFAULT '',
    "state" VARCHAR(5) NOT NULL DEFAULT '1',
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tbl_common_group_pkey" PRIMARY KEY ("group_id")
);

-- CreateTable
CREATE TABLE "tbl_common_group_menu" (
    "group_menu_id" SERIAL NOT NULL,
    "group_id" INTEGER NOT NULL,
    "menu_id" INTEGER NOT NULL,
    "state" VARCHAR(5) NOT NULL DEFAULT '1',
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tbl_common_group_menu_pkey" PRIMARY KEY ("group_menu_id")
);

-- CreateTable
CREATE TABLE "tbl_common_system_menu" (
    "menu_id" SERIAL NOT NULL,
    "menu_name" VARCHAR(300) NOT NULL,
    "menu_icon" VARCHAR(100) NOT NULL DEFAULT '',
    "menu_index" INTEGER NOT NULL DEFAULT 0,
    "api_id" INTEGER,
    "node_type" VARCHAR(2),
    "parent_id" VARCHAR(30) NOT NULL DEFAULT '',
    "state" VARCHAR(5) NOT NULL DEFAULT '1',
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tbl_common_system_menu_pkey" PRIMARY KEY ("menu_id")
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
    "user_password_error" INTEGER NOT NULL DEFAULT 0,
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
    "state" VARCHAR(5) NOT NULL DEFAULT '1',
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tbl_common_user_pkey" PRIMARY KEY ("user_id")
);

-- CreateTable
CREATE TABLE "tbl_common_user_group" (
    "user_group_id" SERIAL NOT NULL,
    "user_id" TEXT NOT NULL,
    "group_id" INTEGER NOT NULL,
    "state" VARCHAR(5) NOT NULL DEFAULT '1',
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tbl_common_user_group_pkey" PRIMARY KEY ("user_group_id")
);
