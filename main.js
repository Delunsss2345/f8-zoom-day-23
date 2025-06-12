const modalId = document.getElementById('taskModal') ; 
const addBtn = document.querySelector('.add-btn') ; 
const closeBtn = document.querySelector('.close-button') ; 
const cancelBtn = document.querySelector('.cancel-button') ;
const addTask = document.querySelector('.add-new-button') ; 
const textBox = document.querySelectorAll('.input-group > input, textarea') ; 
const form = document.getElementById('form');
const todoMain = document.querySelector('.task-grid') ; 
const tabList = document.querySelectorAll('.tab-list .tab-button') ;
const search = document.querySelector('.search-input') ; 
let todoTasks = JSON.parse(localStorage.getItem('todos')) || [] ; 

const toggleButton = [addBtn, closeBtn, cancelBtn];
toggleButton.forEach(btn => {
    btn.onclick = () => {
        modalId.classList.toggle('show');
        modalId.querySelector('.modal-title').innerHTML = 'Add Task' ; 
        if(btn.classList.contains('add-btn')) {
            textBox[0].focus()  ;
            form.removeAttribute('data-editing-id');
        }
        else {
            form.reset() ; 
        }
    };
});

tabList.forEach((tab , index)=> {
    tab.onclick = () => {
        tabList.forEach(t => t.classList.remove("active"));
        tab.classList.add("active");
        if(index === 0) {
            renderTask(todoTasks) ; 
        } else if(index === 1) {
            const activeTask = todoTasks.filter(todo => !todo.isCompleted) ; 
            renderTask(activeTask) ; 
        }
        else if(index === 2) {
            const completedTask = todoTasks.filter(todo => todo.isCompleted) ; 
            renderTask(completedTask) ; 
        }
    }
})

search.addEventListener("input", function () {
  const key = this.value.trim().toLowerCase();

  tabList.forEach(t => t.classList.remove("active"));
  tabList[0].classList.add("active");

  if (key === "") {
    renderTask(todoTasks); 
    return;
  }

  const filterTasks = todoTasks.filter(task =>
    task.title.toLowerCase().includes(key) ||
    task.description.toLowerCase().includes(key)
  );

  if (filterTasks.length > 0) {
    renderTask(filterTasks);
  } else {
    todoMain.innerHTML = "";
    todoMain.innerHTML = "Không có task";
  }
})

//Hàm sửa
const editTask = (task , id) => {
    Object.keys(task).forEach(key => {
        if (form[key]) {
            form[key].value = task[key];
        }
    });

    form.dataset.editingId = id; //Thêm edit vào id
    modalId.classList.toggle('show');
    modalId.querySelector('.modal-title').innerHTML = 'Edit Task' ; 
};

//Hàm xoá
const delTask = (id) => {
    notie.confirm({
    text: 'Bạn có chắc chắn muốn xoá task này?',
    submitText: 'Xoá',
    cancelText: 'Huỷ',
    submitCallback: function () {
        const newTodos = todoTasks.filter((todo , index) => index !== id) ; 
        todoTasks = newTodos ;
        localStorage.setItem("todos" , JSON.stringify(newTodos)) ;
        renderTask(todoTasks) ; 
      notie.alert({ type: 'success', text: 'Đã xoá task', time: 2 });
    },
    cancelCallback: function () {
      notie.alert({ type: 'warning', text: 'Đã huỷ xoá task', time: 2 });
    }
  });
    
};

//Tạo hàm để tối ưu lặp nhiều lần
const taskRender = (tasks) => {
    localStorage.setItem("todos" , JSON.stringify(tasks)) ;
    renderTask(tasks) ;
}

//Hàm cập nhập hoàn thành 
const completeTask = (id) => {
    const todo = todoTasks.find((todo , index) => index === id) ; 
    todo.isCompleted = !todo.isCompleted ;
    todoTasks[id] = todo ;
    taskRender(todoTasks) ; 
};

//Hàm lắng nghe sự kiện ở thẻ to nhất
todoMain.onclick = (e) => {
    const taskId = e.target.closest('.task-card')?.dataset.taskId ; 
    if(e.target.classList.contains('edit')) {
        if(taskId) {
            const task = todoTasks[taskId - 1] ; 
            editTask(task , taskId) ; 
        }
    }
    else if(e.target.classList.contains('delete')) {
        if(taskId) {
            const task = todoTasks[taskId - 1] ; 
            delTask(taskId - 1) ; 
        }
    }
    else if(e.target.classList.contains('complete')) {
        if(taskId) {
            completeTask(taskId - 1) ; 
        }
    }
}
//Hàm chuyển time thành dạng bên mỹ
function formatHoursAndMinutes(time) {
    const [hours, minutes] = time.split(':')
    const date = new Date();
    date.setHours(hours, minutes, 0, 0); 
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true });
}

//Hàm lấy tổng giây để validate
function getSecondTime(time) {
    const [hours, minutes] = time.split(':'); 
    const totalSeconds = (hours * 3600) + (minutes * 60);
    return totalSeconds ; 
}

function validateField(newTask) {
    if(!newTask.title) {
       return alert('Tên tiêu đề không được trống') ; 
    }

    if(!newTask.startTime) {
       return alert('Giờ bắt đầu không được trống') ; 
    }

    if(!newTask.endTime) {
       return alert('Giờ kết thúc không được trống') ; 
    }

    if(getSecondTime(newTask.endTime) < getSecondTime(newTask.startTime)) {
        return alert('Giờ kết thúc bắt buộc lớn hơn giờ bắt đầu') ; 
    }
    
    if(!newTask.DueDate) {
        return alert('Ngày hết hạn không được trống') ; 
    }
    const currentDate = new Date() ; 
    currentDate.setHours(0 , 0 , 0 , 0) ; 

    const tempDate  = new Date(newTask.DueDate) ;
    tempDate.setHours(0 , 0 , 0 , 0) ; 

    if(tempDate < currentDate) {
        return alert('Ngày hết hạn lớn hơn hoặc bằng ngày hiện tại') ; 
    }


    if(!newTask.description) {
       return alert('Mô tả không được trống') ; 
    }
    
    return true ;
}

//Hàm render hổ trợ truyền mảng
function renderTask(todos) {    
    todoMain.innerHTML = "" ; 
    todos.map((task , index) => {
        const taskCard = document.createElement('div');
        taskCard.classList.add('task-card');
        taskCard.dataset.taskId = index + 1 ; 
        taskCard.classList.add(task.cardColor || 'blue');
            
        if (task.isCompleted) {
            taskCard.classList.add('completed');
        }

        const taskHeader = document.createElement('div');
        taskHeader.classList.add('task-header');
            
        const taskTitle = document.createElement('h3');
        taskTitle.classList.add('task-title');
        taskTitle.textContent = task.title;

        const taskMenuButton = document.createElement('button');
        taskMenuButton.classList.add('task-menu');
        taskMenuButton.innerHTML = `
        <i class="fa-solid fa-ellipsis fa-icon"></i>
        <div class="dropdown-menu">
            <div class="dropdown-item edit">
                <i class="fa-solid fa-pen-to-square fa-icon"></i>
                Edit
            </div>
            <div class="dropdown-item complete">
                <i class="fa-solid fa-check fa-icon"></i>
                ${task.isCompleted ? "Mark as active" : "Mark as Complete"}
            </div>
            <div class="dropdown-item delete">
                <i class="fa-solid fa-trash fa-icon"></i>
                Delete
            </div>
        </div>
    `;
        taskHeader.appendChild(taskTitle);
        taskHeader.appendChild(taskMenuButton);

        const taskDescription = document.createElement('p');
        taskDescription.classList.add('task-description');
        taskDescription.textContent = task.description; 

        const taskTime = document.createElement('div');
        taskTime.classList.add('task-time');

        taskTime.textContent = `${formatHoursAndMinutes(task.startTime)} - ${formatHoursAndMinutes(task.endTime)}`;

        taskCard.appendChild(taskHeader);
        taskCard.appendChild(taskDescription);
        taskCard.appendChild(taskTime);

        todoMain.appendChild(taskCard);
    })

}


form.onsubmit = function (e) {
    e.preventDefault(); 
   
    
    const formData = new FormData(form);
    const task = {
        title: formData.get('title').trim(),
        startTime: formData.get('startTime'),
        endTime: formData.get('endTime'),
        DueDate: formData.get('DueDate'),
        category: formData.get('category'),
        cardColor: formData.get('cardColor'),
        description: formData.get('description').trim(),
        priority: formData.get('priority').trim(),
        isCompleted: false
    };

    
    if (!validateField(task)) return;

    const isEdit = form.dataset.editingId ; 
    const newTitle = task.title.toLowerCase() ;
    const isFailedTitle = todoTasks.some((todo , index) => {
        if(index === isEdit - 1) return false ; 
        return todo.title.toLowerCase() === newTitle ;
    })

    if(isFailedTitle) {
        notie.alert({ type: 'warning', text: 'Tiêu đề đã tồn tại', time: 2 });
        return ;
    }

    if(this.dataset.editingId) {
        todoTasks[this.dataset.editingId - 1] = task ; 
        modalId.classList.remove('show');
        taskRender(todoTasks) ;
        notie.alert({ type: 'info', text: 'Cập nhật task thành công', time: 2 });
        form.reset();
        return ; 
    } ;
    

    todoTasks.unshift(task); 
    notie.alert({ type: 'success', text: 'Thêm task thành công', time: 2 });
    taskRender(todoTasks) ; 
    form.reset();
    modalId.classList.remove('show');
};

renderTask(todoTasks) ; 

