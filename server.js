require('dotenv').config();

const client = require('./lib/client');

// Initiate database connection
client.connect();

const app = require('./lib/app');

const PORT = process.env.PORT || 7890;
//get lists of exercises
app.get('/exercises', async(req, res) => {
  const data = await client.query(`select exercises.id, exercises.name,exercises.weight, 
  exercises.is_fullbody, type from exercises join types on exercises.type_id= types.id`);
  //gets all data from DB
  res.json(data.rows);
});

app.get('/types', async(req, res) => {
  const data = await client.query('select * from types');
  //gets all data from DB
  res.json(data.rows);
});

//get just one specific exercise by ID
app.get('/exercises/:id', async(req, res) => {
  try {
    const id = req.params.id;
    const data = await client.query(`select exercises.id, exercises.name, exercises.weight, exercises.is_fullbody, type
    from exercises join types 
    on exercises.type_id= types.id 
    where exercises.id= $1`, [id]);
    // console.log(data.row);
    res.json(data.rows[0]);
  } catch(e) {
    console.error(e);
    res.json(e);
  }
});
//get an exercise by it's name
// app.get('/exercisebyname/:name', async(req, res) => {
//   try {
//     const name = `%${req.params.name}%`;
//     // console.log(name);
//     const data = await client.query('SELECT * from exercises where name ilike $1;', [name]);
//     // console.log(data.row);
//     res.json(data.rows);
//   } catch(e) {
//     console.error(e);
//     res.json(e);
//   }
// });




app.post('/exercises/', async(req, res) => {
  // console.log('=============================\n');
  // console.log('|| req.body', req.body);
  // console.log('\n=============================');
  try {
    
    const data = await client.query(`insert into exercises (name, weight, is_fullbody, type_id, user_id)
    values ($1, $2, $3, $4, $5)
    returning *;`,
    //had to hardcode user as 1 due to fail on heroku's side
    [req.body.name, req.body.weight, req.body.is_fullbody, 1, 1]
    );
    // console.log(data.row);
    res.json(data.rows[0]);
  } catch(e) {
    console.error(e);
    res.json(e);
  }
});

//update name (with ID) on the details page. 
app.put('/exercises/:id', async(req, res) => {
  // console.log('=============================\n');
  // console.log('|| req.body', req.body);
  // console.log('\n=============================');
  try {
    //works in postman locally.
    const id = req.body.id;
    const data = await client.query(`
    update exercises
    set name = $1
    where id = $2
    returning *;`, [req.body.name, id]
    //can't use muliple commands into prepared statement aka you can't combine sql questions/querries, just i just did one. 
    
    );
    // console.log(data.row);
    res.json(data.rows[0]);
  } catch(e) {
    console.error(e);
    res.json(e);
  }
});

//delete by ID (with ID by req.body.id) on the details page. 
app.delete('/exercises/:id', async(req, res) => {
  // console.log('=============================\n');
  // console.log('|| req.body', req.body);
  // console.log('\n=============================');
  try {
    //works in postman locally
    const id = req.body.id;
    const data = await client.query(`
    delete from exercises 
    where id = $1
    returning *;`, [id]
    //can't use muliple commands into prepared statement aka you can't combine sql questions/querries, just i just did one. 
    
    );
   
    res.json(data.rows[0]);
  } catch(e) {
    console.error(e);
    res.json(e);
  }
});



app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Started on ${PORT}`);
});

module.exports = app;

