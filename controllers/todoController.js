'use strict';

const Todo = require('../models/todo');
//const Book = require('../models/book');
const async = require('async');
const expressValidator = require('express-validator');
const { body,validationResult } = require('express-validator/check');
const { sanitizeBody } = require('express-validator/filter');

// Display list of all Todo.
exports.todoList = function(req, res, next) {

  Todo.find()
    .sort([['name', 'ascending']])
    .exec(function (err, list_todos) {
      if (err) { return next(err); }
      // Successful, so render.
      res.render('todos', { title: 'Todo List', list_todos:  list_todos});
    });

};


//
// Display Todo create form on GET.
exports.todocreateget = function(req, res, next) {
    res.render('todoform', { title: 'Create Todo'});
};
//


// // Handle Todo create on POST.
exports.todoCreatePost = [

    // Validate that the name field is not empty.
    body('name', 'Todo name required').isLength({ min: 1 }).trim(),

    // Sanitize (trim and escape) the name field.
    sanitizeBody('name').trim().escape(),

    // Process request after validation and sanitization.
    (req, res, next) => {

        // Extract the validation errors from a request.
        let errors = validationResult(req);

        // Create a todo object with escaped and trimmed data.
        const todo = new Todo(
          { name: req.body.name,
            details: req.body.details
           }
        );


        if (!errors.isEmpty()) {
            // There are errors. Render the form again with sanitized values/error messages.
            res.render('todoform', { title: 'Create Todo', todo: todo, details: details, errors: errors.array()});
        return;
        }
        else {
            // Data from form is valid.
            // Check if Todo with same name already exists.
            Todo.findOne({ 'name': req.body.name })
                //.exec( function(err, foundTodo) {
                .exec( function(err) {
                     if (err) { return next(err); }

                     //return err;
                     // if (foundTodo) {
                     //     // Todo exists, redirect to its detail page.
                     //     //res.redirect(foundTodo);
                     //   //res.redirect('/todos');
                     // }
                    // else {

                         todo.save(function (err) {
                           if (err) { return next(err); }
                           // Todo saved. Redirect to todo detail page.
                           res.redirect(todo.url);
                           return res.render('todos', { todo: todo});
                           //res.redirect('./todos');

                         });

                     //}

                 });
        }
    }
];

// Display detail page for a specific Todo.
exports.todoDetail = function(req, res, next) {

    async.parallel({
        todo: function(callback) {

            Todo.findById(req.params.id)
              .exec(callback);
        },

        // todo_books: function(callback) {
        //   Book.find({ 'todo': req.params.id })
        //   .exec(callback);
        // },

    }, function(err, results) {
        //if (err) { return next(err); }
        if (results.todo===null || results.details===null) { // No results.
            //const err = new Error('Todo not found');
            err.status = 404;
            return next(err);
        }
        // Successful, so render.
        //res.render('todoDetail', { title: 'Todo Detail', todo: results.todo, todo_books: results.todo_books } );
        res.render('todoDetail', { title: 'Todo Detail', todo: results.todo, details: results.details } );
    });

};


// Display Todo delete form on GET.
exports.todoDeleteGet = function(req, res, next) {

    async.parallel({
        todo: function(callback) {
            Todo.findById(req.params.id).exec(callback);
        },
        // todo_books: function(callback) {
        //     Book.find({ 'todo': req.params.id }).exec(callback);
        // },
    }, function(err, results) {
        if (err) { return next(err); }
        if (results.Todo===null) { // No results.
            res.redirect('/todos');
        }
        // Successful, so render.
        res.render('todoDelete', { title: 'Delete Todo', todo: results.todo } );
    });

};


// Handle Todo delete on POST.
exports.todoDeletePost = function(req, res, next) {

    async.parallel({
        todo: function(callback) {
            Todo.findById(req.params.id).exec(callback);
        },
        // todo_books: function(callback) {
        //     Book.find({ 'todo': req.params.id }).exec(callback);
        // },
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
                res.redirect('/todos');
            });

        }
    });

};


// Display Todo update form on GET.
exports.todoUpdateGet = function(req, res, next) {

    Todo.findById(req.params.id, function(err, todo) {
        if (err) { return next(err); }
        if (todo==null) { // No results.
            const err = new Error('Todo not found');
            err.status = 404;
            return next(err);
        }
        // Success.
        res.render('todoform', { title: 'Update Todo', todo: todo });
    });

};

// Handle Todo update on POST.
exports.todoUpdatePost = [

    // Validate that the name field is not empty.
    body('name', 'Todo name required').isLength({ min: 1 }).trim(),

    // Sanitize (trim and escape) the name field.
    sanitizeBody('name').trim().escape(),

    // Process request after validation and sanitization.
    (req, res, next) => {

        // Extract the validation errors from a request .
        const errors = validationResult(req);

    // Create a todo object with escaped and trimmed data (and the old id!)
        const todo = new Todo(
          {
          name: req.body.name,
          details: req.body.details,
          _id: req.params.id
          }
        );


        if (!errors.isEmpty()) {
            // There are errors. Render the form again with sanitized values and error messages.
            res.render('todoform', { title: 'Update Todo', todo: todo, details: todo.details, errors: errors.array()});
        return;
        }
        else {
            // Data from form is valid. Update the record.
            Todo.findByIdAndUpdate(req.params.id, todo, {}, function (err,thetodo) {
                if (err) { return next(err); }
                   // Successful - redirect to todo detail page.
                   res.redirect(thetodo.url);
                });
        }
    }
];
