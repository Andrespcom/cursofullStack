import { useState } from 'react'
import Filter from './components/Filter'
import PersonForm from './components/PersonForm'
import Persons from './components/Persons'
import { useEffect } from 'react'
import axios from 'axios'
import personService from './services/persons'
import Notification from './components/Notification'
import './index.css'
import './App.css' 

const App = () => {
  const [persons, setPersons] = useState([])
  const [newName, setNewName] = useState('')
  const [newNumber, setNewNumber] = useState('')
  const [filter, setFilter] = useState('')
  const [notification, setNotification] = useState(null)
  const [notificationType, setNotificationType] = useState('success')

  useEffect(() => {
    personService
      .getAll()
      .then(initialPersons => {
        setPersons(initialPersons)
      })
  }, [])

  const handleNameChange = (event) => setNewName(event.target.value)
  const handleNumberChange = (event) => setNewNumber(event.target.value)
  const handleFilterChange = (event) => setFilter(event.target.value)

  const handleSubmit = (event) => {
    event.preventDefault()
    const existingPerson = persons.find(person => person.name === newName)
  
    if (existingPerson) {
      const confirmUpdate = window.confirm(
        `${newName} is already added to phonebook, replace the old number with the new one?`
      )
  
      if (confirmUpdate) {
        const updatedPerson = { ...existingPerson, number: newNumber }
  
        personService
        .update(existingPerson.id, updatedPerson)
        .then(returnedPerson => {
          setPersons(persons.map(p => p.id !== existingPerson.id ? p : returnedPerson))
          setNewName('')
          setNewNumber('')
          setNotification(`Updated ${updatedPerson.name}'s number`)
          setNotificationType('success')
          setTimeout(() => setNotification(null), 5000)
        })
        .catch(error => {
          setNotification(error.response?.data?.error || `Information of ${existingPerson.name} has already been removed from server`)
          setNotificationType('error')
          setTimeout(() => setNotification(null), 5000)
          setPersons(persons.filter(p => p.id !== existingPerson.id))
        })
      }
    } else {
      const newPerson = { name: newName, number: newNumber }
  
      personService
      .create(newPerson)
      .then(returnedPerson => {
        setPersons(persons.concat(returnedPerson))
        setNewName('')
        setNewNumber('')
        setNotification(`Added ${newPerson.name}`)
        setNotificationType('success')
        setTimeout(() => setNotification(null), 5000)
      })
      .catch(error => {
        setNotification(error.response?.data?.error || 'Failed to add person')
        setNotificationType('error')
        setTimeout(() => setNotification(null), 5000)
      })
    }
  }

  const handleDelete = (id, name) => {
    console.log(`Trying to delete ${name} with id ${id}`)
    if (window.confirm(`Delete ${name}?`)) {
      personService
        .remove(id)
        .then(() => {
          setPersons(persons.filter(p => p.id !== id))
        })
        .catch(error => {
          setNotification(`Information of ${existingPerson.name} has already been removed from server`)
          setNotificationType('error')
          setTimeout(() => setNotification(null), 5000)
          setPersons(persons.filter(p => p.id !== existingPerson.id))
        })
    }
  }

  const personsToShow = persons.filter(person =>
    person.name.toLowerCase().includes(filter.toLowerCase())
  )

  

  return (
    <div>
      <Notification message={notification} type={notificationType} />
      <h2>Phonebook</h2>
      <Filter filter={filter} onChange={handleFilterChange} />

      <h3>Add a new</h3>
      <PersonForm
        onSubmit={handleSubmit}
        newName={newName}
        onNameChange={handleNameChange}
        newNumber={newNumber}
        onNumberChange={handleNumberChange}
      />

      <h3>Numbers</h3>
      <Persons persons={personsToShow} handleDelete={handleDelete} />
    </div>
  )
}

export default App