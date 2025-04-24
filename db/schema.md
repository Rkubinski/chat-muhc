# SQLite Database Schema

_Generated on Thu 17 Apr 2025 03:12:09 PM EDT_

## Table: `admissions`

**Description:** "The dataset titled ""admissions.csv"" serves a pivotal role in hospital management and healthcare analytics, facilitating the tracking and analysis of patient admissions and outcomes. This dataset is crucial for understanding patient flow, resource allocation, and overall hospital performance. By capturing detailed information about patient admissions, it enables healthcare providers to identify trends, assess the quality of care, and improve operational efficiency. Furthermore, it aids in research initiatives aimed at enhancing patient outcomes and minimizing mortality rates.

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

**Description:** "The dataset titled ""drgcodes.csv"" is designed to capture and categorize patient diagnoses and procedures based on Diagnosis-Related Group (DRG) codes within a hospital setting. DRGs are used primarily for billing and reimbursement purposes, allowing hospitals to classify patient cases into groups that are expected to consume similar amounts of hospital resources. This dataset can assist healthcare administrators, clinicians, and billing departments in analyzing patient demographics, treatment outcomes, and financial performance, thereby improving operational efficiency and patient care quality.

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

**Description:** "The dataset `omr.csv` serves a crucial function in the hospital context by capturing and organizing patient health metrics over time, which is essential for monitoring patient progress, diagnosing conditions, and guiding treatment decisions. This dataset likely belongs to an outpatient medical record system, where healthcare professionals can track changes in vital signs and other health indicators for individual patients. The longitudinal aspect of the data allows for the assessment of trends in health metrics, which can inform clinical decisions and improve patient outcomes.

**Columns:**

| Column | Type | PK |
|--------|------|----|
| `subject_id` | `TEXT` |  |
| `chartdate` | `TEXT` |  |
| `seq_num` | `TEXT` |  |
| `result_name` | `TEXT` |  |
| `result_value` | `TEXT` |  |


## Table: `procedures_icd`

**Description:** "The dataset ""procedures_icd.csv"" is crucial in a hospital context as it serves to document the procedures performed on patients during their hospital admissions, specifically through the use of International Classification of Diseases (ICD) codes. This dataset allows healthcare providers to track, analyze, and report on the various medical procedures administered to patients, which is essential for clinical decision-making, billing, and epidemiological research. By maintaining an accurate record of procedures, hospitals can ensure compliance with healthcare regulations, manage patient care effectively, and assess the quality of services provided.

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

**Description:** "The provided dataset, `d_hcpcs.csv`, serves a crucial function in the healthcare context by cataloging various codes associated with healthcare services, procedures, and items. Specifically, it lists the Healthcare Common Procedure Coding System (HCPCS) codes, which are used for billing and documentation purposes in hospitals and other healthcare facilities. This dataset enables healthcare providers to standardize the coding of services rendered, ensuring accurate billing, effective communication among healthcare professionals, and compliance with regulatory requirements.

**Columns:**

| Column | Type | PK |
|--------|------|----|
| `code` | `TEXT` |  |
| `category` | `TEXT` |  |
| `long_description` | `TEXT` |  |
| `short_description` | `TEXT` |  |


## Table: `emar`

**Description:** "The provided dataset, `emar.csv`, serves a crucial role in the context of hospital medication management, specifically focusing on the electronic medication administration record (eMAR) system. This dataset is designed to track and document the administration of medications to patients during their hospital stays. By capturing detailed information about each medication event, healthcare providers can ensure compliance with medication protocols, monitor patient responses, and enhance overall patient safety. The data can be used for various purposes, including quality assurance, regulatory compliance, and clinical research, ultimately aiming to improve patient outcomes and optimize medication usage.

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

**Description:** "The dataset provided, titled ""patients.csv,"" serves a critical function in a hospital context by capturing essential demographic and clinical data about patients. This information is vital for various purposes, including patient care management, epidemiological studies, and healthcare resource allocation. By analyzing this dataset, healthcare professionals can identify trends in patient demographics, monitor outcomes, and improve service delivery based on the specific needs of different patient groups.

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

**Description:** "The dataset titled ""provider.csv"" serves a crucial role in the healthcare context by cataloging unique identifiers for healthcare providers within a hospital or healthcare system. This dataset is essential for managing and tracking the various healthcare professionals, such as physicians, nurses, and specialists, who deliver care to patients. By utilizing unique provider IDs, hospitals can efficiently maintain records, streamline billing processes, and ensure compliance with regulatory requirements, thereby enhancing overall operational efficiency.

**Columns:**

| Column | Type | PK |
|--------|------|----|
| `provider_id` | `TEXT` |  |


## Table: `d_icd_diagnoses`

**Description:** "The dataset provided, titled ""d_icd_diagnoses.csv,"" serves a critical role in the hospital context by cataloging various medical diagnoses as classified by the International Classification of Diseases (ICD). This dataset is essential for healthcare providers, researchers, and policymakers as it enables standardized coding of diseases and health conditions, facilitating accurate billing, epidemiological studies, and healthcare analytics. By utilizing this dataset, hospitals can ensure compliance with health regulations, improve patient care through better understanding of disease prevalence, and enhance data-driven decision-making processes.

**Columns:**

| Column | Type | PK |
|--------|------|----|
| `icd_code` | `TEXT` |  |
| `icd_version` | `TEXT` |  |
| `long_title` | `TEXT` |  |


## Table: `emar_detail`

**Description:** "The **emar_detail.csv** dataset serves a critical role in hospital medication administration and tracking, specifically focusing on electronic medication administration records (eMAR). This dataset is designed to capture detailed information regarding the administration of medications to patients, including dosage, timing, routes of administration, and any complications or deviations from standard procedures. By analyzing this data, healthcare professionals can ensure compliance with medication protocols, enhance patient safety, and improve overall care quality.

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

**Description:** "The provided dataset, `pharmacy.csv`, serves a crucial role in managing medication administration within a hospital setting. It captures detailed records of medications prescribed and dispensed to patients, which is essential for ensuring patient safety, effective treatment, and compliance with healthcare regulations. This dataset allows healthcare professionals to track medication histories, monitor for potential drug interactions, and assess the efficacy of treatment plans. Additionally, it aids in inventory management and billing processes, as it provides a comprehensive overview of medication usage and associated costs.

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

**Description:** "The dataset titled `services.csv` serves a critical function in the hospital context by tracking the transfer of patients between different medical services or departments. This information is essential for understanding patient flow, resource allocation, and the continuity of care within the hospital. Analyzing this dataset allows healthcare administrators to identify patterns in service usage, optimize staffing, and improve patient outcomes by ensuring that patients receive timely and appropriate care based on their medical needs.

**Columns:**

| Column | Type | PK |
|--------|------|----|
| `subject_id` | `TEXT` |  |
| `hadm_id` | `TEXT` |  |
| `transfertime` | `TEXT` |  |
| `prev_service` | `TEXT` |  |
| `curr_service` | `TEXT` |  |


## Table: `d_icd_procedures`

**Description:** "The dataset titled `d_icd_procedures.csv` serves an essential function in the hospital context by cataloging various medical procedures as defined by the International Classification of Diseases (ICD) coding system. This dataset is crucial for healthcare providers in documenting, billing, and analyzing medical procedures performed on patients. Accurate coding of procedures is vital for ensuring proper reimbursement from insurance companies, tracking healthcare outcomes, and facilitating research on procedural efficacy and safety.

**Columns:**

| Column | Type | PK |
|--------|------|----|
| `icd_code` | `TEXT` |  |
| `icd_version` | `TEXT` |  |
| `long_title` | `TEXT` |  |


## Table: `hcpcsevents`

**Description:** "The dataset ""hcpcsevents.csv"" is a valuable resource in a hospital context, primarily utilized for tracking and analyzing healthcare service events associated with patients. This dataset captures information related to the Healthcare Common Procedure Coding System (HCPCS) codes, which are essential for billing and documenting the services and procedures provided to patients during their hospital stay. By analyzing this data, healthcare providers can assess the utilization of various medical services, ensure compliance with billing regulations, and identify trends in patient care and resource allocation.

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

**Description:** "The dataset provided, named ""poe.csv,"" serves a critical function within a hospital context by tracking physician orders and their statuses throughout a patient's hospital stay. This dataset, which captures various aspects of orders placed by healthcare providers, facilitates the management of patient care and treatment plans, ensuring that all necessary interventions are documented and monitored. By analyzing this data, healthcare professionals can evaluate the efficiency of care delivery, identify trends in order fulfillment, and enhance patient safety by minimizing errors associated with medication and treatment orders.

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

**Description:** "The dataset `d_labitems.csv` serves a crucial role in the hospital context by cataloging various laboratory test items that are essential for diagnosing and monitoring patient health. These tests, typically conducted on blood samples, provide vital information regarding a patient's physiological state, aiding healthcare professionals in making informed clinical decisions. The dataset facilitates the organization and retrieval of lab test information, ensuring that medical staff can efficiently access the necessary tests for patient evaluation and treatment planning.

**Columns:**

| Column | Type | PK |
|--------|------|----|
| `itemid` | `TEXT` |  |
| `label` | `TEXT` |  |
| `fluid` | `TEXT` |  |
| `category` | `TEXT` |  |


## Table: `labevents`

**Description:** "The dataset titled ""labevents.csv"" serves a critical function in the hospital context by documenting laboratory test results for patients. This information is essential for clinical decision-making, monitoring patient health, and providing appropriate treatments. By capturing a comprehensive range of lab results, healthcare providers can track changes in a patient’s condition, assess the effectiveness of treatments, and identify potential health issues early on.

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

**Description:** "The dataset titled ""poe_detail.csv"" serves a crucial function in a hospital context by capturing detailed information related to patient encounters, specifically focusing on the various stages of care that patients experience. This includes admission, transfer, discharge planning, and the management of medical devices such as tubes and drains. The data is instrumental for healthcare professionals to track patient progress, ensure proper care coordination, and facilitate effective discharge planning, which is essential for optimizing patient outcomes and resource allocation within the hospital.

**Columns:**

| Column | Type | PK |
|--------|------|----|
| `poe_id` | `TEXT` |  |
| `poe_seq` | `TEXT` |  |
| `subject_id` | `TEXT` |  |
| `field_name` | `TEXT` |  |
| `field_value` | `TEXT` |  |


## Table: `transfers`

**Description:** "The dataset titled ""transfers.csv"" serves a critical function in the hospital context by documenting patient transfer events within the facility. This information is essential for understanding patient flow, resource allocation, and care coordination, which are vital for optimizing hospital operations and improving patient outcomes. By analyzing transfer data, healthcare administrators can identify patterns in patient movement, assess the efficiency of care units, and ensure that appropriate resources are available at the right time and place.

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

**Description:** "The dataset `diagnoses_icd.csv` serves a critical role in the hospital context by documenting the diagnoses assigned to patients during their hospital admissions. This information is essential for various clinical and administrative purposes, including treatment planning, billing, and epidemiological studies. By capturing diagnostic data coded in accordance with the International Classification of Diseases (ICD), the dataset allows healthcare providers to track patient health trends, evaluate treatment outcomes, and ensure compliance with health regulations.

**Columns:**

| Column | Type | PK |
|--------|------|----|
| `subject_id` | `TEXT` |  |
| `hadm_id` | `TEXT` |  |
| `seq_num` | `TEXT` |  |
| `icd_code` | `TEXT` |  |
| `icd_version` | `TEXT` |  |


## Table: `microbiologyevents`

**Description:** "The dataset ""microbiologyevents.csv"" serves a critical function in the hospital setting by documenting microbiological test events related to patient care, specifically focusing on the identification and analysis of pathogens. This data is essential for tracking the presence of infections, understanding antibiotic resistance patterns, and guiding treatment decisions. By aggregating results from various microbiological tests, healthcare providers can ensure timely and effective interventions, ultimately improving patient outcomes and managing public health concerns related to infectious diseases.

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

**Description:** "The dataset titled ""prescriptions.csv"" serves a critical function in the hospital setting by documenting medication prescriptions for patients. It captures detailed information about the drugs prescribed, including the timing of administration and the healthcare providers involved. This data is essential for ensuring medication safety, managing patient care, and facilitating communication among healthcare providers. Additionally, it can be used for clinical audits, research on medication efficacy, and monitoring adherence to treatment protocols.

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


