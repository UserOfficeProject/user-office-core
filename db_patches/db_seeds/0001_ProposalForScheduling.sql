DO
$DO$
BEGIN

  INSERT INTO instruments (instrument_id, name, short_code, description) VALUES (1, 'Instrument 1', 'INSTR1', 'Test');
  INSERT INTO call_has_instruments (call_id, instrument_id, availability_time, submitted) VALUES (1, 1, NULL, false);

  INSERT INTO questionaries(questionary_id, template_id, created_at, creator_id) VALUES (1, 1, NOW(), 1);

  INSERT INTO proposals (proposal_id, title, abstract, status_id, proposer_id, created_at, updated_at, short_code, rank_order, final_status, sep_id, call_id, questionary_id, comment_for_management, comment_for_user, notified, submitted) VALUES (1, 'Test proposal', 'Lorem ipsum', 8, 1, NOW(), NOW(), '999999', NULL, 1, NULL, 1, 1, NULL, NULL, true, true);

  INSERT INTO instrument_has_proposals(instrument_id, proposal_id) VALUES (1, 1);

  INSERT INTO technical_review (technical_review_id, proposal_id, comment, time_allocation, status, public_comment) VALUES (1, 1, '', 2, 0, '');

END;
$DO$
LANGUAGE plpgsql;
