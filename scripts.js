const label = document.getElementById('label')
const taskList = document.getElementById('taskList')
const form = document.getElementById('form')
const addTask = document.getElementById('addTask')
const listHeader = document.getElementById('listHeader')
const inDB = indexedDB

if(inDB && form){
    let db
    const request = inDB.open('taskList', 1)

    request.onsuccess = () => {
        db = request.result
        console.log('OPEN', db)
        readData()
    }

    request.onupgradeneeded = () => {
        db = request.result
        console.log('CREATE', db)
        const objectStore = db.createObjectStore('tasks', {
            keyPath: 'taskName'
        })
    }

    request.onerror = (error) => {
        console.log('ERROR', error)
    }
    
    const addData = (data) => {
        const transaction = db.transaction(['tasks'], 'readwrite')
        const objectStore = transaction.objectStore('tasks')
        const request = objectStore.add(data)
        readData()
    }

    const getData = (key) => {
        const transaction = db.transaction(['tasks'], 'readwrite')
        const objectStore = transaction.objectStore('tasks')
        const request = objectStore.get(key)
        
        request.onsuccess = () => {
            form.task.value = request.result.taskName
            form.priority.value = request.result.taskPriority
            form.button.dataset.action = 'update'
        }
    }

    const updateData = (data) => {
        const transaction = db.transaction(['tasks'], 'readwrite')
        const objectStore = transaction.objectStore('tasks')
        const request = objectStore.put(data)
        request.onsuccess = () => {
            form.button.dataset.action = 'add'
            label.textContent = 'New task'
            form.button.textContent = 'Add task'
            addTask.classList.remove('update')
            listHeader.classList.remove('ocult')
            taskList.classList.remove('ocult')
            readData()
        }
    }

    const deleteData = (key) => {
        const transaction = db.transaction(['tasks'], 'readwrite')
        const objectStore = transaction.objectStore('tasks')
        const request = objectStore.delete(key)
        request.onsuccess = () => {
            form.button.dataset.action = 'add'
            readData()
        }
    }

    const readData = () => {
        const transaction = db.transaction(['tasks'], 'readonly')
        const objectStore = transaction.objectStore('tasks')
        const request = objectStore.openCursor()
        const fragment = document.createDocumentFragment()

        request.onsuccess = (e) => {
            const cursor = e.target.result
            if(cursor){
                const taskTitle = document.createElement('DIV')
                taskTitle.textContent = cursor.value.taskName
                taskTitle.classList.add('grid-item')
                fragment.appendChild(taskTitle)

                const taskPriority = document.createElement('DIV')
                taskPriority.textContent = cursor.value.taskPriority
                taskPriority.classList.add('grid-item')
                fragment.appendChild(taskPriority)

                const taskUpdate = document.createElement('BUTTON')
                taskUpdate.dataset.type = 'update'
                taskUpdate.dataset.key = cursor.key
                taskUpdate.textContent = 'Update'
                fragment.appendChild(taskUpdate)

                const taskDelete = document.createElement('BUTTON')
                taskDelete.textContent = 'Delete'
                taskDelete.dataset.type = 'delete'
                taskDelete.dataset.key = cursor.key
                fragment.appendChild(taskDelete)

                cursor.continue()
            } else {
                taskList.textContent = ''
                taskList.appendChild(fragment)
            }
        }
    }

    form.addEventListener('submit', (e) => {
        e.preventDefault()

        const data = {
            taskName: e.target.task.value,
            taskPriority: e.target.priority.value
        }
        if(e.target.button.dataset.action == 'add'){
            addData(data)
        } else if(e.target.button.dataset.action == 'update'){
            updateData(data)
        }
        form.reset()
    })
    taskList.addEventListener('click', (e) => {
        if(e.target.dataset.type == 'update'){
            getData(e.target.dataset.key)
            label.textContent = 'Update task'
            form.button.textContent = 'Update'
            addTask.classList.add('update')
            listHeader.classList.add('ocult')
            taskList.classList.add('ocult')
        } else if (e.target.dataset.type == 'delete'){
            deleteData(e.target.dataset.key)
        }
    })
}