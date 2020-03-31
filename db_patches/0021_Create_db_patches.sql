CREATE TABLE db_patches (
	patch_id  varchar(100) NOT NULL PRIMARY KEY
	, author    varchar(50) NOT NULL
	, purpose   varchar(600) NULL
	, created_at  TIMESTAMPTZ NOT NULL
	, applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
	);

CREATE OR REPLACE FUNCTION register_patch(new_patch_id TEXT, author TEXT, purpose TEXT, created_at TIMESTAMPTZ) RETURNS boolean AS $$
    BEGIN
    IF EXISTS (SELECT 1 FROM db_patches WHERE patch_id=new_patch_id) THEN
	RAISE WARNING 'Refusing to apply patch. Patch id % already present', new_patch_id;
        return false;
    ELSE 
        INSERT INTO db_patches VALUES(new_patch_id, author, purpose, created_at);
        return true;
    END IF;
    END
$$ LANGUAGE plpgsql;


CREATE OR REPLACE FUNCTION unregister_patch(new_patch_id TEXT) RETURNS boolean AS $$
    BEGIN
    IF EXISTS (SELECT 1 FROM db_patches WHERE patch_id=new_patch_id) THEN
	RAISE NOTICE 'Unergistering pathc %', new_patch_id;
	DELETE FROM db_patches WHERE patch_id=new_patch_id;
        return true;
    ELSE 
        RAISE NOTICE 'Cant unregister. Patch % does not exist', new_patch_id;
        return false;
    END IF;
    END
$$ LANGUAGE plpgsql;

DO
$$
BEGIN
	IF register_patch('Create_db_patches', 'jekabskarklins', 'Adding tracking DB patch functionality', '2020-03-21') THEN
	BEGIN
		INSERT INTO db_patches
		VALUES
			('init.sql', 'unknown', 'init', '2019-10-01 00:00:00.000000+00'),
			('CreateTopicReadinessState.sql', 'jekabskarklins', 'Adding new table for keeping track which steps have been finished when submitting proposal', '2019-10-17'),
			('AlterProposals.sql', 'jekabskarklins', 'Implementing proposal shortcode', '2019-10-17'),
			('AlterProposalUser.sql', 'jekabskarklins', 'Implementing deleting proposal', '2019-10-17'),
			('AlterProposalQuestions.sql', 'jekabskarklins', 'BUGFIX can''t save large enbellishments', '2019-10-17'),
			('AlterProposalAnswer.sql', 'jekabskarklins', 'BUGFIX can''t save long answers', '2019-11-06'),
			('AlterProposalQuestionDependencies.sql', 'jekabskarklins', 'BUGFIX can''t save long dependencies', '2019-11-11'),
			('AlterUsers.sql', 'fredrikbolmsten', 'Make user fields longer', '2019-11-14'),
			('AddPrivacyCookiePages.sql', 'fredrikbolmsten', 'Adding new pages', '2019-11-14'),
			('AddNationalitiesTable.sql', 'fredrikbolmsten', 'Adding new table for nationalities', '2019-11-19'),
			('AddInstitutionTable.sql', 'fredrikbolmsten', 'Adding new table for institution', '2019-11-19'),
			('AddCountryTable.sql', 'fredrikbolmsten', 'Adding new table for countries ', '2019-11-19'),
			('ChangeUserTable.sql', 'fredrikbolmsten', 'link new columns to user table', '2019-11-26'),
			('MigrateUsers.sql', 'fredrikbolmsten', 'Setting nationality and organisation for users', '2019-11-26'),
			('AlterUsersEmailInvite.sql', 'fredrikbolmsten', 'Adding column for accounts created by invite', '2019-11-28'),
			('AlterUserGenderLen.sql', 'fredrikbolmsten', 'Make gender field longer', '2019-11-28'),
			('AlterUserTitleLength.sql', 'fredrikbolmsten', 'Make user title longer', '2019-12-10'),
			('AlterProposalTitleAbstractLen.sql', 'fredrikbolmsten', 'Make proposal title longer', '2019-12-10'),
			('AlterProposalNewFields.sql', 'fredrikbolmsten', 'Adding new columns for proposals', '2020-02-16'),
			('AddTechnicalReviewTable.sql', 'fredrikbolmsten', 'Adding new table for technical review ', '2020-01-24'),
			('AlterProposalQuestion.sql', 'jekabskarklins', 'Adding column nid (natural id)', '2020-02-24'),
			('Create_db_patches.sql', 'martintrajanovski', 'Adding new table for storing events.', '2020-03-04'),
			('AddReviewPage.sql', 'Fredrik Bolmsten', 'Add new row for reviewpage text', '2020-03-18');
	END;
	END IF;
END;
$$
LANGUAGE plpgsql;