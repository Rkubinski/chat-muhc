# SQLite Database Schema

_Generated on Thu 17 Apr 2025 03:18:56 PM EDT_

## Table: `admissions`

**Columns:**

| Column | Type | PK |
|--------|------|----|
| `subject_id` | `TEXT` |  |
| `hadm_id` | `TEXT` |  |
| `admittime` | `TEXT` |  |
| `dischtime` | `TEXT` |  |
| `deathtime` | `TEXT` |  |
| `admission_type` | `TEXT` |  |
| `admit_provider_id` | `TEXT` |  |
| `admission_location` | `TEXT` |  |
| `discharge_location` | `TEXT` |  |
| `insurance` | `TEXT` |  |
| `language` | `TEXT` |  |
| `marital_status` | `TEXT` |  |
| `race` | `TEXT` |  |
| `edregtime` | `TEXT` |  |
| `edouttime` | `TEXT` |  |
| `hospital_expire_flag` | `TEXT` |  |


## Table: `drgcodes`

**Columns:**

| Column | Type | PK |
|--------|------|----|
| `subject_id` | `TEXT` |  |
| `hadm_id` | `TEXT` |  |
| `drg_type` | `TEXT` |  |
| `drg_code` | `TEXT` |  |
| `description` | `TEXT` |  |
| `drg_severity` | `TEXT` |  |
| `drg_mortality` | `TEXT` |  |


## Table: `omr`

**Columns:**

| Column | Type | PK |
|--------|------|----|
| `subject_id` | `TEXT` |  |
| `chartdate` | `TEXT` |  |
| `seq_num` | `TEXT` |  |
| `result_name` | `TEXT` |  |
| `result_value` | `TEXT` |  |


## Table: `procedures_icd`

**Columns:**

| Column | Type | PK |
|--------|------|----|
| `subject_id` | `TEXT` |  |
| `hadm_id` | `TEXT` |  |
| `seq_num` | `TEXT` |  |
| `chartdate` | `TEXT` |  |
| `icd_code` | `TEXT` |  |
| `icd_version` | `TEXT` |  |


## Table: `d_hcpcs`

**Columns:**

| Column | Type | PK |
|--------|------|----|
| `code` | `TEXT` |  |
| `category` | `TEXT` |  |
| `long_description` | `TEXT` |  |
| `short_description` | `TEXT` |  |


## Table: `emar`

**Columns:**

| Column | Type | PK |
|--------|------|----|
| `subject_id` | `TEXT` |  |
| `hadm_id` | `TEXT` |  |
| `emar_id` | `TEXT` |  |
| `emar_seq` | `TEXT` |  |
| `poe_id` | `TEXT` |  |
| `pharmacy_id` | `TEXT` |  |
| `enter_provider_id` | `TEXT` |  |
| `charttime` | `TEXT` |  |
| `medication` | `TEXT` |  |
| `event_txt` | `TEXT` |  |
| `scheduletime` | `TEXT` |  |
| `storetime` | `TEXT` |  |


## Table: `patients`

**Columns:**

| Column | Type | PK |
|--------|------|----|
| `subject_id` | `TEXT` |  |
| `gender` | `TEXT` |  |
| `anchor_age` | `TEXT` |  |
| `anchor_year` | `TEXT` |  |
| `anchor_year_group` | `TEXT` |  |
| `dod` | `TEXT` |  |


## Table: `provider`

**Columns:**

| Column | Type | PK |
|--------|------|----|
| `provider_id` | `TEXT` |  |


## Table: `d_icd_diagnoses`

**Columns:**

| Column | Type | PK |
|--------|------|----|
| `icd_code` | `TEXT` |  |
| `icd_version` | `TEXT` |  |
| `long_title` | `TEXT` |  |


## Table: `emar_detail`

**Columns:**

| Column | Type | PK |
|--------|------|----|
| `subject_id` | `TEXT` |  |
| `emar_id` | `TEXT` |  |
| `emar_seq` | `TEXT` |  |
| `parent_field_ordinal` | `TEXT` |  |
| `administration_type` | `TEXT` |  |
| `pharmacy_id` | `TEXT` |  |
| `barcode_type` | `TEXT` |  |
| `reason_for_no_barcode` | `TEXT` |  |
| `complete_dose_not_given` | `TEXT` |  |
| `dose_due` | `TEXT` |  |
| `dose_due_unit` | `TEXT` |  |
| `dose_given` | `TEXT` |  |
| `dose_given_unit` | `TEXT` |  |
| `will_remainder_of_dose_be_given` | `TEXT` |  |
| `product_amount_given` | `TEXT` |  |
| `product_unit` | `TEXT` |  |
| `product_code` | `TEXT` |  |
| `product_description` | `TEXT` |  |
| `product_description_other` | `TEXT` |  |
| `prior_infusion_rate` | `TEXT` |  |
| `infusion_rate` | `TEXT` |  |
| `infusion_rate_adjustment` | `TEXT` |  |
| `infusion_rate_adjustment_amount` | `TEXT` |  |
| `infusion_rate_unit` | `TEXT` |  |
| `route` | `TEXT` |  |
| `infusion_complete` | `TEXT` |  |
| `completion_interval` | `TEXT` |  |
| `new_iv_bag_hung` | `TEXT` |  |
| `continued_infusion_in_other_location` | `TEXT` |  |
| `restart_interval` | `TEXT` |  |
| `side` | `TEXT` |  |
| `site` | `TEXT` |  |
| `non_formulary_visual_verification` | `TEXT` |  |


## Table: `pharmacy`

**Columns:**

| Column | Type | PK |
|--------|------|----|
| `subject_id` | `TEXT` |  |
| `hadm_id` | `TEXT` |  |
| `pharmacy_id` | `TEXT` |  |
| `poe_id` | `TEXT` |  |
| `starttime` | `TEXT` |  |
| `stoptime` | `TEXT` |  |
| `medication` | `TEXT` |  |
| `proc_type` | `TEXT` |  |
| `status` | `TEXT` |  |
| `entertime` | `TEXT` |  |
| `verifiedtime` | `TEXT` |  |
| `route` | `TEXT` |  |
| `frequency` | `TEXT` |  |
| `disp_sched` | `TEXT` |  |
| `infusion_type` | `TEXT` |  |
| `sliding_scale` | `TEXT` |  |
| `lockout_interval` | `TEXT` |  |
| `basal_rate` | `TEXT` |  |
| `one_hr_max` | `TEXT` |  |
| `doses_per_24_hrs` | `TEXT` |  |
| `duration` | `TEXT` |  |
| `duration_interval` | `TEXT` |  |
| `expiration_value` | `TEXT` |  |
| `expiration_unit` | `TEXT` |  |
| `expirationdate` | `TEXT` |  |
| `dispensation` | `TEXT` |  |
| `fill_quantity` | `TEXT` |  |


## Table: `services`

**Columns:**

| Column | Type | PK |
|--------|------|----|
| `subject_id` | `TEXT` |  |
| `hadm_id` | `TEXT` |  |
| `transfertime` | `TEXT` |  |
| `prev_service` | `TEXT` |  |
| `curr_service` | `TEXT` |  |


## Table: `d_icd_procedures`

**Columns:**

| Column | Type | PK |
|--------|------|----|
| `icd_code` | `TEXT` |  |
| `icd_version` | `TEXT` |  |
| `long_title` | `TEXT` |  |


## Table: `hcpcsevents`

**Columns:**

| Column | Type | PK |
|--------|------|----|
| `subject_id` | `TEXT` |  |
| `hadm_id` | `TEXT` |  |
| `chartdate` | `TEXT` |  |
| `hcpcs_cd` | `TEXT` |  |
| `seq_num` | `TEXT` |  |
| `short_description` | `TEXT` |  |


## Table: `poe`

**Columns:**

| Column | Type | PK |
|--------|------|----|
| `poe_id` | `TEXT` |  |
| `poe_seq` | `TEXT` |  |
| `subject_id` | `TEXT` |  |
| `hadm_id` | `TEXT` |  |
| `ordertime` | `TEXT` |  |
| `order_type` | `TEXT` |  |
| `order_subtype` | `TEXT` |  |
| `transaction_type` | `TEXT` |  |
| `discontinue_of_poe_id` | `TEXT` |  |
| `discontinued_by_poe_id` | `TEXT` |  |
| `order_provider_id` | `TEXT` |  |
| `order_status` | `TEXT` |  |


## Table: `table_descriptions`

**Columns:**

| Column | Type | PK |
|--------|------|----|
| `Filename` | `TEXT` |  |
| `File Type` | `TEXT` |  |
| `File Path` | `TEXT` |  |
| `Analysis JSON Path` | `TEXT` |  |
| `Description Summary` | `TEXT` |  |
| `Number of Questions` | `TEXT` |  |
| `Timestamp` | `TEXT` |  |
| `Description` | `TEXT` |  |
| `Administrative_Questions` | `TEXT` |  |
| `Research_Questions` | `TEXT` |  |
| `Clinical_Questions` | `TEXT` |  |
| `Full_Description` | `TEXT` |  |
| `Full_Questions` | `TEXT` |  |
| `Raw_JSON` | `TEXT` |  |


## Table: `d_labitems`

**Columns:**

| Column | Type | PK |
|--------|------|----|
| `itemid` | `TEXT` |  |
| `label` | `TEXT` |  |
| `fluid` | `TEXT` |  |
| `category` | `TEXT` |  |


## Table: `labevents`

**Columns:**

| Column | Type | PK |
|--------|------|----|
| `labevent_id` | `TEXT` |  |
| `subject_id` | `TEXT` |  |
| `hadm_id` | `TEXT` |  |
| `specimen_id` | `TEXT` |  |
| `itemid` | `TEXT` |  |
| `order_provider_id` | `TEXT` |  |
| `charttime` | `TEXT` |  |
| `storetime` | `TEXT` |  |
| `value` | `TEXT` |  |
| `valuenum` | `TEXT` |  |
| `valueuom` | `TEXT` |  |
| `ref_range_lower` | `TEXT` |  |
| `ref_range_upper` | `TEXT` |  |
| `flag` | `TEXT` |  |
| `priority` | `TEXT` |  |
| `comments` | `TEXT` |  |


## Table: `poe_detail`

**Columns:**

| Column | Type | PK |
|--------|------|----|
| `poe_id` | `TEXT` |  |
| `poe_seq` | `TEXT` |  |
| `subject_id` | `TEXT` |  |
| `field_name` | `TEXT` |  |
| `field_value` | `TEXT` |  |


## Table: `transfers`

**Columns:**

| Column | Type | PK |
|--------|------|----|
| `subject_id` | `TEXT` |  |
| `hadm_id` | `TEXT` |  |
| `transfer_id` | `TEXT` |  |
| `eventtype` | `TEXT` |  |
| `careunit` | `TEXT` |  |
| `intime` | `TEXT` |  |
| `outtime` | `TEXT` |  |


## Table: `diagnoses_icd`

**Columns:**

| Column | Type | PK |
|--------|------|----|
| `subject_id` | `TEXT` |  |
| `hadm_id` | `TEXT` |  |
| `seq_num` | `TEXT` |  |
| `icd_code` | `TEXT` |  |
| `icd_version` | `TEXT` |  |


## Table: `microbiologyevents`

**Columns:**

| Column | Type | PK |
|--------|------|----|
| `microevent_id` | `TEXT` |  |
| `subject_id` | `TEXT` |  |
| `hadm_id` | `TEXT` |  |
| `micro_specimen_id` | `TEXT` |  |
| `order_provider_id` | `TEXT` |  |
| `chartdate` | `TEXT` |  |
| `charttime` | `TEXT` |  |
| `spec_itemid` | `TEXT` |  |
| `spec_type_desc` | `TEXT` |  |
| `test_seq` | `TEXT` |  |
| `storedate` | `TEXT` |  |
| `storetime` | `TEXT` |  |
| `test_itemid` | `TEXT` |  |
| `test_name` | `TEXT` |  |
| `org_itemid` | `TEXT` |  |
| `org_name` | `TEXT` |  |
| `isolate_num` | `TEXT` |  |
| `quantity` | `TEXT` |  |
| `ab_itemid` | `TEXT` |  |
| `ab_name` | `TEXT` |  |
| `dilution_text` | `TEXT` |  |
| `dilution_comparison` | `TEXT` |  |
| `dilution_value` | `TEXT` |  |
| `interpretation` | `TEXT` |  |
| `comments` | `TEXT` |  |


## Table: `prescriptions`

**Columns:**

| Column | Type | PK |
|--------|------|----|
| `subject_id` | `TEXT` |  |
| `hadm_id` | `TEXT` |  |
| `pharmacy_id` | `TEXT` |  |
| `poe_id` | `TEXT` |  |
| `poe_seq` | `TEXT` |  |
| `order_provider_id` | `TEXT` |  |
| `starttime` | `TEXT` |  |
| `stoptime` | `TEXT` |  |
| `drug_type` | `TEXT` |  |
| `drug` | `TEXT` |  |
| `formulary_drug_cd` | `TEXT` |  |
| `gsn` | `TEXT` |  |
| `ndc` | `TEXT` |  |
| `prod_strength` | `TEXT` |  |
| `form_rx` | `TEXT` |  |
| `dose_val_rx` | `TEXT` |  |
| `dose_unit_rx` | `TEXT` |  |
| `form_val_disp` | `TEXT` |  |
| `form_unit_disp` | `TEXT` |  |
| `doses_per_24_hrs` | `TEXT` |  |
| `route` | `TEXT` |  |


