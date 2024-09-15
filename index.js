const express = require('express');
const app = express();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const cors = require('cors');
const port = 3000;

app.use(cors());
app.use(express.json());

const uri = "mongodb+srv://nirobaurnab:Ou9w7Uv6ZTRHD2qV@cluster0.nhkvl.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    await client.connect();
    const tasksCollection = client.db('treehouse').collection('tasks');
    const usersCollection = client.db('treehouse').collection('users');

    //GET ALL ITEMS
    app.get('/tasks', async(req, res) => {
      const query = {};
      const cursor = tasksCollection.find(query);
      const items = await cursor.toArray();
      res.send(items);
    });

    app.post('/tasks', async(req, res) => {
      const task = req.body;
      const result = await tasksCollection.insertOne(task);
      res.send(result);
    });

    app.get('/tasks/:id', async(req, res) => {
      const id = req.params.id;
      const query = {_id: new ObjectId(id)};
      const result = await tasksCollection.findOne(query);
      res.send(result);
    });

    app.delete('/tasks/:id', async(req, res) => {
      const id = req.params.id;
      const query = {_id: new ObjectId(id)};
      const result = await tasksCollection.deleteOne(query);
      res.send(result);
    });

    app.delete('/subtasks/:taskId/:subtaskId', async (req, res) => {
      const { taskId, subtaskId } = req.params;
  
      if (!taskId || !subtaskId) {
          return res.status(400).send({ message: 'Task ID and Subtask ID are required' });
      }
  
      try {
          const result = await tasksCollection.updateOne(
              { _id: new ObjectId(taskId) },
              { $pull: { subtasks: { id: parseInt(subtaskId) } } }
          );
  
          if (result.modifiedCount === 1) {
              res.status(200).send({ message: 'Subtask deleted successfully' });
          } else {
              res.status(400).send({ message: 'Failed to delete subtask' });
          }
      } catch (error) {
          console.error(error);
          res.status(500).send({ message: 'Server error' });
      }
  });
  

    //GET ALL USERS
    app.get('/users', async(req, res) => {
      const query = {};
      const cursor = usersCollection.find(query);
      const user = await cursor.toArray();
      res.send(user);
    });

  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get('/', (req, res) => {
  res.send("Server is running");
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
