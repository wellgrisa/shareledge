var middlewares = require('./middlewares');

module.exports = function(app, passport) {
  // Home route
  var index = require('../app/controllers/index');
  app.get('/', index.render);

  //Setting up the users api
  app.post('/send_curriculum', index.send_curriculum);

  // Employees
  var employees = require('../app/controllers/employees');
  app.get('/employees', employees.all);
  app.get('/bs-admin/employees', middlewares.ensureAuthenticated, employees.index);
  app.get('/bs-admin/employees/new', middlewares.ensureAuthenticated, employees.new);
  app.post('/bs-admin/employees', middlewares.ensureAuthenticated, employees.create);
  app.get('/bs-admin/employees/:id', middlewares.ensureAuthenticated, employees.show);
  app.get('/bs-admin/employees/:id/edit', middlewares.ensureAuthenticated, employees.edit);
  app.put('/bs-admin/employees/:id', middlewares.ensureAuthenticated, employees.update);
  app.del('/bs-admin/employees/:id', middlewares.ensureAuthenticated, employees.destroy);
  
  // Jobs
  var jobs = require('../app/controllers/jobs');
  app.get('/jobs', jobs.all);
  app.get('/positions', jobs.positions);
  app.get('/bs-admin/jobs', middlewares.ensureAuthenticated, jobs.index);
  app.get('/bs-admin/jobs/new', middlewares.ensureAuthenticated, jobs.new);
  app.post('/bs-admin/jobs', middlewares.ensureAuthenticated, jobs.create);
  app.get('/bs-admin/jobs/:id', middlewares.ensureAuthenticated, jobs.show);
  app.get('/bs-admin/jobs/:id/edit', middlewares.ensureAuthenticated, jobs.edit);
  app.put('/bs-admin/jobs/:id', middlewares.ensureAuthenticated, jobs.update);
  app.del('/bs-admin/jobs/:id', middlewares.ensureAuthenticated, jobs.destroy);

  // Admin
  var admin = require('../app/controllers/admin');
  app.get('/bs-admin', middlewares.ensureAuthenticated, admin.render);
  app.get('/login', admin.login);
  app.post('/login', admin.authenticate(passport));
  app.get('/logout', admin.logout);
};