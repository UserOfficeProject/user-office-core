import Knex = require("knex");
import express from "express";

const path = require("path");
const fs = require("fs");

const router = express.Router();
router.delete("/reset-db", async (req, res) => {
  var fs = require("fs");
  var sql = fs.readFileSync("./db_patches/0000_init.sql").toString();

  const db = Knex({
    client: "postgresql",
    connection: "postgres://duouser:duopassword@127.0.0.1:5432/duo"
  });

  return;
  await db.raw(`
  DELETE FROM call;
  DELETE FROM files;
  DELETE FROM proposal_answers;
  DELETE FROM proposal_answers_files;
  DELETE FROM proposal_question_dependencies;
  DELETE FROM proposal_questions;
  DELETE FROM proposal_topic_completenesses;
  DELETE FROM proposal_topics;
  DELETE FROM proposal_user;
  DELETE FROM reviews;
  DELETE FROM role_user;
  DELETE FROM proposals;
  DELETE FROM users;

  INSERT INTO users (
        user_title, 
        firstname, 
        middlename, 
        lastname, 
        username, 
        password,
        preferredname,
        orcid,
        orcid_refreshToken,
        gender,
        nationality,
        birthdate,
        organisation,
        department,
        organisation_address,
        position,
        email,
        email_verified,
        telephone,
        telephone_alt
    ) 
    VALUES 
    (
        'Mr.', 
        'Carl',
        'Christian', 
        'Carlsson', 
        'testuser', 
        '$2a$10$1svMW3/FwE5G1BpE7/CPW.aMyEymEBeWK4tSTtABbsoo/KaSQ.vwm',
        '123123123',
        '123123123',
        '581459604',
        'male',
        'Norwegian',
        '2000-04-02',
        'Roberts, Reilly and Gutkowski',
        'IT deparment',
        'Estonia, New Gabriella, 4056 Cronin Motorway',
        'Strategist',
        'Javon4@hotmail.com',
        true,
        '(288) 431-1443',
        '(370) 386-8976'
        );

    INSERT INTO role_user (role_id, user_id) VALUES (1, 1);


    INSERT INTO users (
                user_title, 
                firstname, 
                middlename, 
                lastname, 
                username, 
                password,
                preferredname,
                orcid,
                orcid_refreshToken,
                gender,
                nationality,
                birthdate,
                organisation,
                department,
                organisation_address,
                position,
                email,
                email_verified,
                telephone,
                telephone_alt
                ) 
    VALUES (
            'Mr.', 
            'Anders', 
            'Adam',
            'Andersson', 
            'testofficer', 
            '$2a$10$1svMW3/FwE5G1BpE7/CPW.aMyEymEBeWK4tSTtABbsoo/KaSQ.vwm',
            'Rhiannon',
            '878321897',
            '123123123',
            'male',
            'French',
            '1981-08-05',
            'Pfannerstill and Sons',
            'IT department',
            'Congo, Alleneville, 35823 Mueller Glens',
            'Liaison',
            'Aaron_Harris49@gmail.com',
            true,
            '711-316-5728',
            '1-359-864-3489 x7390'
            );

    INSERT INTO role_user (role_id, user_id) VALUES (2, 2);

    INSERT INTO users (
                user_title, 
                firstname, 
                middlename, 
                lastname, 
                username, 
                password,
                preferredname,
                orcid,
                orcid_refreshToken,
                gender,
                nationality,
                birthdate,
                organisation,
                department,
                organisation_address,
                position,
                email,
                email_verified,
                telephone,
                telephone_alt
                ) 
    VALUES (
            'Mr.', 
            'Nils', 
            'Adam',
            'Nilsson', 
            'testreviewer', 
            '$2a$10$1svMW3/FwE5G1BpE7/CPW.aMyEymEBeWK4tSTtABbsoo/KaSQ.vwm',
            'Rhiannon',
            '878321897',
            '123123123',
            'male',
            'French',
            '1981-08-05',
            'Pfannerstill and Sons',
            'IT department',
            'Congo, Alleneville, 35823 Mueller Glens',
            'Liaison',
            'nils@ess.se',
            true,
            '711-316-5728',
            '1-359-864-3489 x7390'
            );

    INSERT INTO role_user (role_id, user_id) VALUES (3, 3);


    INSERT INTO call(
        call_short_code 
        , start_call 
        , end_call 
        , start_review 
        , end_review 
        , start_notify
        , end_notify
        , cycle_comment 
        , survey_comment )
    VALUES(
        'call 1', 
        '2019-01-01', 
        '2023-01-01',
        '2019-01-01', 
        '2023-01-01',
        '2019-01-01', 
        '2023-01-01', 
        'This is cycle comment', 
        'This is survey comment');
    `);
  return res.status(200);
});

//joining path of directory
const directoryPath = path.join(__dirname, "Documents");
//passsing directoryPath and callback function
fs.readdir(directoryPath, function(err, files) {
  //handling error
  if (err) {
    return console.log("Unable to scan directory: " + err);
  }
  //listing all files using forEach
  files.forEach(function(file) {
    // Do whatever you want to do with the file
    console.log(file);
  });
});
module.exports = router;
