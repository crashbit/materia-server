var expect = require('chai').expect
var DBEntity = require('../lib/entities/db-entity')
var Entity = require('../lib/entities/abstract/entity')
var History = require('../lib/history')

describe('Entity', () => {

})

describe('DBEntity', () => {
	let mock_app = {
		name: 'app',
		path: __dirname + '/samples/todo-app'
	}
	mock_app.history = new History(mock_app)
	describe('Constructor', () => {
		let entity1;
		let entity2;
		before(() => {
			entity1 = new DBEntity(mock_app, 'entity1')
			entity2 = new DBEntity(mock_app, 'entity2', [
				{
					name: 'id',
					primary: true,
					unique: true,
					type: 'number',
					autoIncrement: true
				},
				{
					name: 'field2'
				}
			])
		})
		it('should have a name and default value', () => {
			expect(entity1).to.have.property('name')
			expect(entity1.name).to.equal('entity1')

			expect(entity2.name).to.equal('entity2')
			expect(entity2.fields[0].type).to.equal('number')

			//need to test PK / Unique / required / autoincrement and defaultValue
		})

		it('should have fields initialized', () => {
			expect(entity2.fields).to.be.instanceof(Array);
			expect(entity2.fields.length).to.equal(2)
			expect(entity1.fields).to.be.instanceof(Array);
			expect(entity1.fields.length).to.equal(0)
		})
	})

	describe('addField()', () => {
		let entity;
		beforeEach(() => {
			entity = new DBEntity(mock_app, {name: 'entity1'})
		})

		it('should add a field', (done) => {
			expect(entity.fields.length).to.equal(0)
			entity.addField({ name: 'testField' })
			expect(entity.fields.length).to.equal(1)
			expect(entity.getField('testField')).to.be.instanceof(Object)
			expect(entity.getField('testField').name).to.equal('testField')
			done()
		})
	})

	describe('addFieldFirst()', () => {
		let entity;
		beforeEach(() => {
			entity = new DBEntity(mock_app, {name: 'entity1'})
		})

		it('should add a field in first position', (done) => {
			expect(entity.fields.length).to.equal(0)
			entity.addField({ name: 'testField' })
			entity.addFieldFirst({ name: 'testField2' })
			expect(entity.fields.length).to.equal(2)
			expect(entity.fields[0].name).to.equal('testField2')
			done()
		})
	})
})
