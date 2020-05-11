const client = require('../lib/client');
// import our seed data:
const exercises = require('./exercises.js');
const usersData = require('./users.js');
const typeData = require('./types.js');

run();

async function run() {

  try {
    await client.connect();

    await Promise.all(
      typeData.map(types => {
        return client.query(`
                    INSERT INTO types (type)
                    VALUES ($1);
                `,
        [types.type]);
      })
    );
    
    const users = await Promise.all(
      usersData.map(user => {
        return client.query(`
                      INSERT INTO users (email, hash)
                      VALUES ($1, $2)
                      RETURNING *;
                  `,
        [user.email, user.hash]);
      })
    );
      
    const user = users[0].rows[0];

    await Promise.all(
      exercises.map(excercise => {
        return client.query(`
                    INSERT INTO exercises (name, weight, is_fullbody, type_id, user_id)
                    VALUES ($1, $2, $3, $4, $5);
                `,
        [excercise.name, excercise.weight, excercise.is_fullbody, excercise.type_id, user.id]);
      })
    );
    
   
    console.log('seed data load complete');
  }
  catch(err) {
    console.log(err);
  }
  finally {
    client.end();
  }
    
}
