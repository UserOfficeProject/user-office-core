DO
$$
BEGIN
	IF register_patch('AlterQuestionariesAddCreator.sql', 'jekabskarklins', 'Add creator column to questionaries', '2020-06-23') THEN
	BEGIN

        ALTER TABLE questionaries ADD COLUMN creator_id INTEGER;

        UPDATE questionaries
        SET creator_id = (
            SELECT proposer_id 
            FROM proposals 
            WHERE questionary_id = questionaries.questionary_id );

        ALTER TABLE questionaries ADD CONSTRAINT questionaries_creator_id_fkey
            FOREIGN KEY (creator_id)
            REFERENCES users(user_id);


    END;
	END IF;
END;
$$
LANGUAGE plpgsql;