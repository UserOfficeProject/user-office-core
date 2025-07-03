DO
$$
BEGIN
  IF register_patch('0186_AddExperimentRefNumberFormat.sql', 'Yoganandan Pandiyan', 'Adding Experiment Reference Number format to facilitate dynamic generation of Experiment Number, similar to Proosal', '2025-05-02') THEN
    BEGIN
      ALTER TABLE proposals ADD COLUMN experiment_sequence integer; -- New column for experiment sequence. For Every Proposal, the experiment sequence will start from 1.
      ALTER TABLE experiments ADD COLUMN reference_number_sequence integer; -- New column for experiment reference number sequence. This is to maintain the sequence number of experiment. In case of update of experiment number, this sequence number will be used for reference.
    END;
  END IF;
END;
$$
LANGUAGE plpgsql;
