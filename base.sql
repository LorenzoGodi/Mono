CREATE TABLE IF NOT EXISTS bank
(
    bank_name varchar(50),
    bank_money integer NOT NULL DEFAULT 0 CHECK (bank_money >= 0),
    bank_ismain boolean NOT NULL DEFAULT false,
    CONSTRAINT bank_pkey PRIMARY KEY (bank_name)
);

CREATE TABLE IF NOT EXISTS income
(
    income_id serial PRIMARY KEY,
    income_datetime varchar(50) NOT NULL,
    income_to varchar(50) NOT NULL,
    income_amount integer NOT NULL,
    income_tag varchar(50),
    income_info varchar(50),
    CONSTRAINT income_income_datetime_key UNIQUE (income_datetime),
    CONSTRAINT income_income_to_fkey FOREIGN KEY (income_to)
        REFERENCES bank (bank_name) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION,
    CONSTRAINT income_income_amount_check CHECK (income_amount > 0)
);

CREATE TABLE IF NOT EXISTS outflow
(
    outflow_id serial PRIMARY KEY,
    outflow_datetime varchar(50) NOT NULL,
    outflow_from varchar(50) NOT NULL,
    outflow_amount integer NOT NULL,
    outflow_tag varchar(50),
    outflow_info varchar(50),
    CONSTRAINT outflow_income_datetime_key UNIQUE (outflow_datetime),
    CONSTRAINT outflow_income_to_fkey FOREIGN KEY (outflow_from)
        REFERENCES bank (bank_name) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION,
    CONSTRAINT outflow_outflow_amount_check CHECK (outflow_amount > 0)
);

CREATE TABLE IF NOT EXISTS trans
(
    trans_id serial PRIMARY KEY,
    trans_datetime varchar(50) NOT NULL,
    trans_from varchar(50) NOT NULL,
    trans_to character varying(50) NOT NULL,
    trans_amount integer NOT NULL,
    trans_tag varchar(50),
    trans_info varchar(50),
    CONSTRAINT trans_trans_datetime_key UNIQUE (trans_datetime),
    CONSTRAINT trans_trans_from_fkey FOREIGN KEY (trans_from)
        REFERENCES public.bank (bank_name) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION,
    CONSTRAINT trans_trans_to_fkey FOREIGN KEY (trans_to)
        REFERENCES public.bank (bank_name) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION,
    CONSTRAINT trans_check CHECK (trans_from <> trans_to),
    CONSTRAINT trans_trans_amount_check CHECK (trans_amount > 0)
);