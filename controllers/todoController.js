'use strict';

const mongoose = require('mongoose');
const Todo = require('../models/todo');
const async = require('async');
const expressValidator = require('express-validator');
const { body,validationResult } = require('express-validator/check');
const { sanitizeBody } = require('express-validator/filter');

// Display list of all Todos w/pagination
exports.getTodos = async (req, res) => {
  const page = req.params.page || 1; //home page url = 1
  const limit = 4;
  const skip = (page * limit) - limit; //skip 1st six if on page #2, etc...

  // 1. Query the database for a list of all todos
  const todosPromise = Todo
    .find()
    .skip(skip)
    .limit(limit)
    .sort({ created: 'desc' }); //sort descending...show latest todo 1st

  const countPromise = Todo.count();//get count of all todos in database
//Fire off todosPromise & countPromise @ same time BUT 'wait' for both to come back
  const [todos, count] = await Promise.all([todosPromise, countPromise]); //pass in array of promises
  const pages = Math.ceil(count / limit); //get upper limit of # todos / how many per page
  if (!todos.length && skip) {//redirect to last page of pagination if page requested does not exist
    req.flash('info', `Hey! You asked for page ${page}. But that doesn't exist. So I put you on page ${pages}`);
    res.redirect(`/todos/page/${pages}`);
    return;
  }

  res.render('todos', { title: 'Todo', todos, page, pages, count });
};


//
// Display Todo create form on GET.
exports.todocreateget = function(req, res, next) {
    res.render('todoform', { title: 'Create'});
};
//


exports.addTodo = async (req, res) => {
  //res.json(req.body);
  req.body.author = req.user._id;
  req.body.user = req.params.id;//user ID is in the URL (ie., params)
  const newTodo = new Todo(req.body); //create new todo
  await newTodo.save();
  req.flash('success', 'Todo Saved!');
  res.redirect('/todos');
};


// Display detail page for a specific Todo.
exports.todoDetail = function(req, res, next) {

    async.parallel({
        todo: function(callback) {

            Todo.findById(req.params.id)
              .exec(callback);
        },

    }, function(err, results) {
        //if (err) { return next(err); }
        if (results.todo===null || results.details===null) { // No results.
            //const err = new Error('Todo not found');
            err.status = 404;
            return next(err);
        }
        // Successful, so render.
        res.render('todoDetail', { title: 'Todo Detail', todo: results.todo, details: results.details } );
    });

};

// exports.TodoDeleteGet = async (req, res) => {
//   // 1. Find the todo given the ID
//   const todo = await Todo.findById(req.params.id).exec(callback);
//   // 2. confirm they are the owner of the todo
//   confirmOwner(todo, req.user);
//
//   // 3. Render out the edit form so the user can update their todo
//   res.render('todoDelete', { title: `Delete Todo ${todo.name}`, todo });
//   //res.render('todoform', { title: 'Update Todo', todo: todo });
//
// };
// Display Todo delete form on GET.


exports.todoDeleteGet = async (req, res) => {
  // 1. Find the todo given the ID
  const todo = await Todo.findOne({ _id: req.params.id });
  // 2. confirm they are the owner of the todo
  confirmOwner(todo, req.user);

  // 3. Render out the edit form so the user can update their todo
  res.render('todoDelete', { title: `Delete Todo ${todo.name}`, todo });
  //res.render('todoform', { title: 'Update Todo', todo: todo });

};

// exports.deleteTodo = async (req, res) => {
//
//   // find and update the todo
//   const todo = await Todo.findByIdAndRemove(req.params.id).exec();
//   req.flash('success', `Successfully deleted <strong>${todo.name}</strong>.`);
//   //res.redirect(`/todos/${todo._id}/update`);
//   res.render('todoDelete', { title: 'Delete Todo', todo: todo } );
//   res.redirect('/todos');
//
// };
// Handle Todo delete on POST.
exports.todoDeletePost = function(req, res, next) {

    async.parallel({
        todo: function(callback) {
            Todo.findById(req.params.id).exec(callback);
        },

    }, function(err, results) {
        if (err) { return next(err); }
        // Success
        //if (results.todo_books.length > 0) {
        if (results.todo > 0) {
            // Todo has books. Render in same way as for GET route.
            res.render('todoDelete', { title: 'Delete Todo', todo: results.todo } );
            return;
        }
        else {
            // Todo has no books. Delete object and redirect to the list of todos.
            Todo.findByIdAndRemove(req.body.id, function deleteTodo(err) {
                if (err) { return next(err); }
                // Success - go to todos list.
                req.flash('success', `Successfully deleted <strong>Todo</strong>.`);
                res.redirect('/todos');
            });

        }
    });

};




//create function to confirmOwner before moving on to editTodo middleware + run it inside of editTodo
const confirmOwner = (todo, user) => {
  if (!todo.author.equals(user._id)) {
    throw Error('You must be the author to edit this!');

}
};


exports.editTodoGet = async (req, res) => {
  // 1. Find the todo given the ID
  const todo = await Todo.findOne({ _id: req.params.id });
  // 2. confirm they are the owner of the todo
  confirmOwner(todo, req.user);
  // 3. Render out the edit form so the user can update their todo
  res.render('todoform', { title: `Update Todo ${todo.name}`, todo });
  //res.render('todoform', { title: 'Update Todo', todo: todo });

};

exports.updateTodo = async (req, res) => {

  // find and update the todo
  const todo = await Todo.findOneAndUpdate({ _id: req.params.id }, req.body, {
    new: true, // return the new todo instead of the old one
    runValidators: true
  }).exec();
  req.flash('success', `Successfully updated <strong>${todo.name}</strong>.`);
  //res.redirect(`/todos/${todo._id}/update`);
  res.redirect(todo.url);

};
