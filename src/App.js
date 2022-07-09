/* src/App.js */
import React, { useEffect, useState } from 'react'
import { Amplify, API, graphqlOperation } from 'aws-amplify'
import { createPoll } from './graphql/mutations'
import { listPolls } from './graphql/queries'
import { withAuthenticator, Button, Heading } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';

import awsExports from "./aws-exports";
Amplify.configure(awsExports);

const initialState = { name: '', description: '' }

const App = ({ signOut, user }) => {
  const [formState, setFormState] = useState(initialState)
  const [polls, setPolls] = useState([])

  useEffect(() => {
    fetchPolls()
  }, [])

  function setInput(key, value) {
    setFormState({ ...formState, [key]: value })
  }

  async function fetchPolls() {
    try {
      const pollData = await API.graphql(graphqlOperation(listPolls))
      const polls = pollData.data.listPolls.items
      setPolls(polls)
    } catch (err) { console.log('error fetching polls') }
  }

  async function addPoll() {
    try {
      if (!formState.name || !formState.description) return
      const poll = { ...formState }
      setPolls([...polls, poll])
      setFormState(initialState)
      await API.graphql(graphqlOperation(createPoll, { input: poll }))
    } catch (err) {
      console.log('error creating poll:', err)
    }
  }

  return (
    <div style={styles.container}>
      <Heading level={1}>Hello {user.username}</Heading>
      <Button onClick={signOut}>Sign out</Button>

      <h2>Amplify Polls</h2>
      <input
        onChange={event => setInput('name', event.target.value)}
        style={styles.input}
        value={formState.name}
        placeholder="Name"
      />
      <input
        onChange={event => setInput('description', event.target.value)}
        style={styles.input}
        value={formState.description}
        placeholder="Description"
      />
      <button style={styles.button} onClick={addPoll}>Create Poll</button>
      {
        polls.map((poll, index) => (
          <div key={poll.id ? poll.id : index} style={styles.poll}>
            <p style={styles.pollName}>{poll.name}</p>
            <p style={styles.pollDescription}>{poll.description}</p>
          </div>
        ))
      }
    </div>
  )
}

const styles = {
  container: { width: 400, margin: '0 auto', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: 20 },
  poll: { marginBottom: 15 },
  input: { border: 'none', backgroundColor: '#ddd', marginBottom: 10, padding: 8, fontSize: 18 },
  pollName: { fontSize: 20, fontWeight: 'bold' },
  pollDescription: { marginBottom: 0 },
  button: { backgroundColor: 'black', color: 'white', outline: 'none', fontSize: 18, padding: '12px 0px' }
}

export default withAuthenticator(App);