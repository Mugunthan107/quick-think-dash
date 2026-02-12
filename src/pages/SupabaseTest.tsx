import { useState, useEffect } from 'react'
import supabase from '../utils/supabase'

function SupabaseTest() {
    const [todos, setTodos] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [newTask, setNewTask] = useState('')

    useEffect(() => {
        fetchTodos()
    }, [])

    async function fetchTodos() {
        try {
            setLoading(true)
            const { data, error } = await supabase.from('todos').select('*').order('created_at', { ascending: false })

            if (error) throw error

            if (data) {
                setTodos(data)
            }
        } catch (err: any) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    async function addTodo(e: React.FormEvent) {
        e.preventDefault()
        if (!newTask.trim()) return

        try {
            const { data, error } = await supabase
                .from('todos')
                .insert([{ task: newTask, is_complete: false }])
                .select()

            if (error) throw error

            if (data) {
                setTodos([data[0], ...todos])
                setNewTask('')
            }
        } catch (err: any) {
            alert('Error adding todo: ' + err.message)
        }
    }

    return (
        <div className="p-8 max-w-2xl mx-auto">
            <h1 className="text-3xl font-bold mb-6">Supabase Connectivity Test</h1>

            <div className="bg-card border rounded-xl p-6 shadow-sm mb-6">
                <h2 className="text-xl font-semibold mb-4">Add New Todo</h2>
                <form onSubmit={addTodo} className="flex gap-2">
                    <input
                        type="text"
                        value={newTask}
                        onChange={(e) => setNewTask(e.target.value)}
                        placeholder="Enter a task..."
                        className="flex-1 p-2 border rounded-md bg-background"
                    />
                    <button
                        type="submit"
                        className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
                    >
                        Add
                    </button>
                </form>
            </div>

            <div className="bg-card border rounded-xl p-6 shadow-sm">
                <h2 className="text-xl font-semibold mb-4">Todo List</h2>

                {loading && <p>Loading...</p>}
                {error && <p className="text-destructive">Error: {error}</p>}

                {!loading && !error && todos.length === 0 && (
                    <p className="text-muted-foreground">No todos found. Add one above!</p>
                )}

                <ul className="space-y-2">
                    {todos.map((todo) => (
                        <li key={todo.id} className="p-3 bg-secondary/50 rounded-lg flex justify-between items-center">
                            <span>{todo.task}</span>
                            <span className="text-xs text-muted-foreground">
                                {todo.is_complete ? 'Completed' : 'Pending'}
                            </span>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    )
}

export default SupabaseTest
