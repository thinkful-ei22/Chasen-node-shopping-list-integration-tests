'use strict'

const chai = require('chai');
const chaiHttp = require('chai-http');

const {app, runServer, closeServer} = require('../server');

const expect = chai.expect;

chai.use(chaiHttp);

describe('Recipes', function() {
  before(function() {
    return runServer();
  });
  after(function() {
    return closeServer();
  });
//GET TEST
  it('should list recipes on GET', function() {
    return chai.request(app)
      .get('/recipes')
      .then(function(res) {
        expect(res).to.have.status(200);
        expect(res).to.be.json;
        expect(res.body).to.be.a('array');
        expect(res.body.length).to.be.above(0);
        res.body.forEach(function(item) {
          expect(item).to.be.a('object');
          expect(item).to.have.all.keys(
            'id','name', 'ingredients');
        });
      });
    })
//POST TEST
    it('should add a recipe on POST', function() {
      const newRecipe= {
        name: "milkshake",
        ingredients: ["2 tbsp cocoa",
        "2 cups vanilla ice cream",
        "1 cup milk"]
      }
      return chai.request(app)
        .post('/recipes')
        .send(newRecipe)
        .then(function(res) {
          expect(res).to.have.status(201);
          expect(res).to.be.json;
          expect(res.body).to.be.a('object');
          expect(res.body).to.include.keys('id', 'name', 'ingredients');
          expect(res.body.id).to.not.equal(null);
          expect(res.body).to.deep.equal(Object.assign(newRecipe, {id: res.body.id}));
        });
    });
//PUT TEST
  it('should update recipes on PUT', function() {
    const updateData = {
      name: 'foo',
      ingredients: 'bar'
    };
    return chai.request(app)
      // first have to get so we have an idea of object to update
      .get('/recipes')
      .then(function(res) {
        updateData.id = res.body[0].id;
        return chai.request(app)
          .put(`/recipes/${updateData.id}`)
          .send(updateData)
      .then(function(res) {
          expect(res).to.have.status(200);
          expect(res).to.be.json;
          expect(res.body).to.be.a('object');
          expect(res.body.id).to.equal(updateData.id);
          expect(res.body.name).to.equal(updateData.name);
          expect(res.body.ingredients).to.equal(updateData.ingredients);
        });
      })
  });
//DELETE TEST
it('should delete items on DELETE', function() {
  return chai.request(app)
    // first have to get so we have an `id` of item
    // to delete
    .get('/recipes')
    .then(function(res) {
      return chai.request(app)
        .delete(`/recipes/${res.body[0].id}`);
    })
    .then(function(res) {
      expect(res).to.have.status(204);
    });
  })
});
