const express = require("express");
const mysql = require("mysql2");
const bodyParser = require("body-parser");
const bcrypt = require("bcryptjs");
const cors = require("cors");

const app = express();
const port = 4000;

// middlewares
app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(bodyParser.json());
app.use(cors());

// DB Connection Settings
const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "root123",
    database: "task_management"
})

// DB Con confirmation message
db.connect(err => {
    if(err){
        console.log("Error connecting in MySQL Database.");
    }else{
        console.log("MySQL Database Connection is Successful!");
    }
})

// Routes
// Get All Tasks for a User (Active Only)
app.get("/tasks/all/:user_id", (req, res) => {
    const user_id = req.params.user_id;
    const sql = "SELECT * FROM tasks WHERE user_id = ? ORDER BY taskCreated DESC";

    db.query(sql, [user_id], (err, result) => {
        if (err) {
            res.send({
                code: 0,
                codeMessage: "server-error",
                details: "There is a problem while retrieving all tasks."
            });
            return;
        } else {
            if (result.length <= 0) {
                res.send({
                    code: 2,
                    codeMessage: "no-task-found",
                    details: "Task table in the database is empty."
                });
            } else {
                res.json({
                    code: 1,
                    codeMessage: "tasks-retrieved",
                    details: result
                });
            }
        }
    });
});

// Add new task
app.post("/tasks/create", (req, res) => {
    let { taskName, taskDescription, isActive, taskCreated, user_id } = req.body;

    // Convert to MySQL DATETIME format if taskCreated is a string
    if (typeof taskCreated === "string") {
        taskCreated = toMySQLDateTime(new Date(taskCreated));
    } else if (taskCreated instanceof Date) {
        taskCreated = toMySQLDateTime(taskCreated);
    }

    const sql =
        `INSERT INTO tasks(taskName, taskDescription, isActive, taskCreated, user_id) VALUES (?, ?, ?, ?, ?)`;

    db.query(sql,
        [taskName, taskDescription, isActive, taskCreated, user_id], (err, result) => {
            if (err) {
                console.error("SQL Error:", err);
                res.send({
                    code: 0,
                    codeMessage: "server-error",
                    details: "There is a problem while adding the task.",
                    error: err
                });
                return;
            } else {
                res.send({
                    code: 1,
                    codeMessage: "task-added",
                    details: `${taskName.toUpperCase()} is now added to your list.`
                });
            }
        });
});

// Get Specific Task by ID and User
app.get("/tasks/:user_id/:taskId", (req, res) => {
    const { user_id, taskId } = req.params;
    const sql = `SELECT * FROM tasks WHERE task_id = ? AND user_id = ?`;

    db.query(sql, [taskId, user_id], (err, result) => {
        if (err || result.length <= 0) {
            res.send({
                code: 0,
                codeMessage: "task-not-found",
                details: "Cannot find the task with the provided ID."
            });
            return;
        } else {
            res.json({
                code: 1,
                codeMessage: "task-found",
                details: result
            });
        }
    });
});

// Complete Specific Task (by user)
app.put("/tasks/complete/:user_id/:taskId", (req, res) => {
    const { user_id, taskId } = req.params;
    const sql = `UPDATE tasks SET isActive = ?, taskCompleted = ? WHERE task_id = ? AND user_id = ?`;

    db.query(sql, [0, new Date(), taskId, user_id], (err, result) => {
        if (err || result.affectedRows === 0) {
            res.send({
                code: 0,
                codeMessage: "task-not-found",
                details: "Task cannot be updated or the task is not found."
            });
            return;
        } else {
            res.send({
                code: 1,
                codeMessage: "task-completed",
                details: "Task is now marked as complete."
            });
        }
    });
});

// Delete Task (by user)
app.delete("/tasks/delete/:user_id/:taskId", (req, res) => {
    const { user_id, taskId } = req.params;
    const check = "SELECT * FROM tasks WHERE task_id = ? AND user_id = ?";
    const sql = "DELETE FROM tasks WHERE task_id = ? AND user_id = ?";

    db.query(check, [taskId, user_id], (err, result) => {
        if (err) {
            res.send({
                code: 0,
                codeMessage: "task-not-found",
                details: "The task cannot be deleted or the task is not found"
            });
            return;
        } else {
            if (result.length <= 0) {
                res.send({
                    code: 0,
                    codeMessage: "task-not-found",
                    details: "The task cannot be deleted or the task is not found"
                });
            } else {
                db.query(sql, [taskId, user_id], (err, result) => {
                    if (err) {
                        res.send({
                            code: 0,
                            codeMessage: "task-not-found",
                            details: "The task cannot be deleted or the task is not found"
                        });
                        return;
                    } else {
                        res.send({
                            code: 1,
                            codeMessage: "task-deleted",
                            details: "The task was deleted successfully!"
                        });
                    }
                });
            }
        }
    });
});

// USER ROUTES

// User sign up
app.post("/users/register", async (req, res) => {
    const {fname, mname, lname, email, pass} = req.body;

    if(!fname || !mname || !lname || !email || !pass){
        res.send({
            code: 0,
            codeMessage: "some-fields-empty",
            details: "Please fill all required fields."
        })
    }

    const check = "SELECT * FROM users WHERE email = ?";

    db.query(check, [email], async (err, result) => {
        if(err){
            res.send({
            code: 0,
            codeMessage: "server-error",
            details: "Cannot accept your registration at the moment."
        })
        }

        if(result.length > 0){
            res.send({
                code: 2,
                codeMessage: "user-already-existing",
                details: "The email you provided was already registered."
            })
        }else{
            const hashedPassword = await bcrypt.hash(pass, 10);

            const sql = "INSERT INTO users(fname, mname, lname, email, pass) VALUES (?, ?, ?, ? ,?)";

            db.query(sql, [fname, mname, lname, email, hashedPassword], (err, result) => {
                if(err){
                    res.send({
                    code: 0,
                    codeMessage: "server-error",
                    details: "Cannot accept your registration at the moment."
                    })
                }else{
                    res.json({
                        code: 1,
                        codeMessage: "registration-success",
                        details: `${fname} ${lname}, you are now registered.`
                    })
                }
            })
        }  

    })
})

// User Auth/Login

app.post("/users/login", (req, res) => {
    const {email, pass} = req.body;
    const sql = "SELECT * FROM users WHERE email = ?";

    db.query(sql, email, async (err, result) => {
        if(err){
            res.send({
                code: 0,
                codeMessage: "server-error",
                details: "There is a problem with your request. Please try again."
            })
        }else if(result.length <= 0){
            res.send({
                code: 2,
                codeMessage: "user-not-found",
                details: "The email provided is not registered."
            })
        }else{
            const user = result[0];
            const isMatched = await bcrypt.compare(pass, user.pass);

            if(!isMatched){
                res.send({
                code: 3,
                codeMessage: "error-details",
                details: "The email or password is incorrect."
                })
            }else{
                res.send({
                code: 1,
                codeMessage: "login-success",
                details: `Welcome to UTask, ${user.fname} ${user.lname}!`,
                user_data: {
                    user_id: result[0].user_id,
                    fname: result[0].fname,
                    mname: result[0].mname,
                    lname: result[0].lname,
                    email: result[0].email
                }
                })
            }
        }
    })
})

function toMySQLDateTime(jsDate) {
    const pad = n => n < 10 ? '0' + n : n;
    return jsDate.getFullYear() + '-' +
        pad(jsDate.getMonth() + 1) + '-' +
        pad(jsDate.getDate()) + ' ' +
        pad(jsDate.getHours()) + ':' +
        pad(jsDate.getMinutes()) + ':' +
        pad(jsDate.getSeconds());
}

app.listen(port, () => console.log(`Server is running at port ${port}.`));