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
	RAISE NOTICE 'Refusing to apply patch. Patch id % already present', new_patch_id;
        return false;
    ELSE 
	RAISE NOTICE 'Applying %', v_job_id;
        INSERT INTO db_patches VALUES(new_patch_id, author, purpose, created_at);
        RAISE NOTICE 'Patch % successfully applied', new_patch_id;
        return true;
    END IF;
    END
$$ LANGUAGE plpgsql;


DO
$$
BEGIN
	IF register_patch('0021_Create_db_patches', 'jekabskarklins', 'Adding tracking DB patch functionality', '2020-03-21') THEN
	BEGIN
		INSERT INTO db_patches
		VALUES
			('0000_init.sql', 'unknown', 'init', '2019-10-01 00:00:00.000000+00'),
			('0001_CreateTopicReadinessState.sql', 'jekabskarklins', 'Adding new table for keeping track which steps have been finished when submitting proposal', '2019-10-17'),
			('0002_AlterProposals.sql', 'jekabskarklins', 'Implementing proposal shortcode', '2019-10-17'),
			('0003_AlterProposalUser.sql', 'jekabskarklins', 'Implementing deleting proposal', '2019-10-17'),
			('0004_AlterProposalQuestions.sql', 'jekabskarklins', 'BUGFIX can''t save large enbellishments', '2019-10-17'),
			('0005_AlterProposalAnswer.sql', 'jekabskarklins', 'BUGFIX can''t save long answers', '2019-11-06'),
			('0006_AlterProposalQuestionDependencies.sql', 'jekabskarklins', 'BUGFIX can''t save long dependencies', '2019-11-11'),
			('0006_AlterUsers.sql', 'fredrikbolmsten', 'Make user fields longer', '2019-11-14'),
			('0007_AddPrivacyCookiePages.sql', 'fredrikbolmsten', 'Adding new pages', '2019-11-14'),
			('0008_AddNationalitiesTable.sql', 'fredrikbolmsten', 'Adding new table for nationalities', '2019-11-19'),
			('0009_AddInstitutionTable.sql', 'fredrikbolmsten', 'Adding new table for institution', '2019-11-19'),
			('0010_AddCountryTable.sql', 'fredrikbolmsten', 'Adding new table for countries ', '2019-11-19'),
			('0011_ChangeUserTable.sql', 'fredrikbolmsten', 'link new columns to user table', '2019-11-26'),
			('0012_MigrateUsers.sql', 'fredrikbolmsten', 'Setting nationality and organisation for users', '2019-11-26'),
			('0013_AlterUsersEmailInvite.sql', 'fredrikbolmsten', 'Adding column for accounts created by invite', '2019-11-28'),
			('0014_AlterUserGenderLen.sql', 'fredrikbolmsten', 'Make gender field longer', '2019-11-28'),
			('0014_AlterUserTitleLength.sql', 'fredrikbolmsten', 'Make user title longer', '2019-12-10'),
			('0015_AlterProposalTitleAbstractLen.sql', 'fredrikbolmsten', 'Make proposal title longer', '2019-12-10'),
			('0016_AlterProposalNewFields.sql', 'fredrikbolmsten', 'Adding new columns for proposals', '2020-02-16'),
			('0017_AddTechnicalReviewTable.sql', 'fredrikbolmsten', 'Adding new table for technical review ', '2020-01-24'),
			('0018_AlterProposalQuestion.sql', 'jekabskarklins', 'Adding column nid (natural id)', '2020-02-24'),
			('0019_Create_db_patches.sql', 'martintrajanovski', 'Adding new table for storing events.', '2020-03-04'),
			('0020_AddReviewPage.sql', 'Fredrik Bolmsten', 'Add new row for reviewpage text', '2020-03-18');
	END;
	END IF;
END;
$$
LANGUAGE plpgsql;