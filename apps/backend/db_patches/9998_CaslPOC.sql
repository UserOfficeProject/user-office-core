DO
$$
BEGIN
  IF register_patch('9998_CaslPOC.sql', 'scotthurley', 'Casl', '2026-01-29') THEN
    
    BEGIN
    CREATE TABLE IF NOT EXISTS permissions(
                permission_id serial UNIQUE,
                action varchar(100) DEFAULT NULL,
                subject varchar(100) DEFAULT NULL,
                conditions varchar(200) DEFAULT NULL,
                is_db_permission bool DEFAULT false
    );

    CREATE TABLE IF NOT EXISTS role_has_permission(
          role_id integer NOT NULL REFERENCES roles (role_id) ON UPDATE CASCADE ON DELETE CASCADE,
          permission_id integer NOT NULL REFERENCES permissions (permission_id) ON UPDATE CASCADE ON DELETE CASCADE,
          PRIMARY KEY (role_id, permission_id)
    );

    INSERT INTO permissions(action, subject, conditions, is_db_permission) VALUES
        ('update', 'fap', '{ "user.userId": { "$in": "fap.fapChairUserIds" } }', false),
        ('archive', 'call', ' { "shortCode": { "$regex": "/LSF/i" }}', false),
        ('delete', 'proposal', '{"proposal.proposerId": "user.userId", "proposal.submitted": false}', false),
        ('read', 'proposal', '{"isInternalReviewer": true}', false),
        ('read', 'proposal', '{"isMemberOfFapProposal": true}', false),
        ('read', 'proposal_dashboard', NULL, false),
        ('delete', 'proposal', NULL, false),
        ('create', 'proposal', NULL, false),
        ('read', 'dashboard', NULL, false),
        ('read', 'experiment_times', NULL, false),
        ('read', 'call', NULL, false),
        ('read', 'proposal', NULL, false),
        ('read', 'permission', NULL, false),
        ('read', 'technique_proposal', NULL, false),
        ('read', 'experiment', NULL, false),
        ('read', 'fap', NULL, false),
        ('read', 'instrument', NULL, false),
        ('read', 'technique', NULL, false),
        ('read', 'tag', NULL, false),
        ('read', 'proposal_workflow', NULL, false),
        ('read', 'institution', NULL, false),
        ('read', 'people', NULL, false),
        ('read', 'question', NULL, false),
        ('read', 'setting', NULL, false),
        ('read', 'status_action_logs', NULL, false),
        ('read', 'template', NULL, false),
        ('read', 'proposal', '{"isVisitorOfProposal": true}', false),
        ('read', 'proposal', '{"isDataAccessUserOfProposal": true}', false),
        ('read', 'proposal', '{"isMemberOfProposal": true}', false),
        ('read', 'proposal', '{"isInstrumentManagerToProposal": true}', false),
        ('read', 'proposal', '{"isScientistToProposalTechnique": true}', false),
        ('read', 'proposal', '{"isScientistToProposal": true}', false),
        ('read', 'fap_proposal_assignment', NULL, false),
        ('read', 'fap_proposal_assignment', '{"user_id": "userId"}', true),
        ('update', 'fap', NULL, false);

    INSERT INTO role_has_permission(role_id, permission_id) VALUES
        (4,1),
        (2,7),
        (1,3),
        (2,2),
        (1,8),
        (1,9),
        (1,10),
        (2,11),
        (2,12),
        (2,13),
        (2,14),
        (2,15),
        (2,16),
        (2,17),
        (2,18),
        (2,19),
        (2,20),
        (2,21),
        (2,22),
        (2,23),
        (4,16),
        (5,16),
        (6,16),
        (7,14),
        (7,15),
        (7,17),
        (8,15),
        (4,9),
        (5,9),
        (6,9),
        (7,9),
        (2,24),
        (2,25),
        (2,26),
        (2,6),
        (7,12),
        (1,29),
        (7,30),
        (9,4),
        (4,5),
        (5,5),
        (6,5),
        (8,12),
        (1,27),
        (1,28),
        (7,32),
        (7,31),
        (2,33),
        (4,33),
        (5,33),
        (6,33),
        (6,34),
        (2,35);

    END;
  END IF;
END;
$$
LANGUAGE plpgsql;