document.addEventListener("DOMContentLoaded", function () {
    // Task Management
    const addTaskBtn = document.getElementById("addTaskBtn");
    const taskInput = document.getElementById("taskInput");
    const bins = document.querySelectorAll(".bin, .completed-bin");
    const completedAudio = document.getElementById("completedAudio");
    const trashCan = document.getElementById("trashCan");
    let xpPoints = 0;
    

    // Load tasks from localStorage
    loadTasks();

    // Add Task on Button Click & Enter Key
    function addTask() {
        if (taskInput.value.trim() === "") return;
        const newTask = document.createElement("div");
        newTask.classList.add("sticky-note");
        newTask.textContent = taskInput.value;
        newTask.draggable = true;
        newTask.setAttribute("id", "task-" + Math.random().toString(36).substr(2, 9));
        newTask.addEventListener("dragstart", dragStart);
        newTask.addEventListener("dragend", dragEnd);
        document.getElementById("q1").appendChild(newTask);
        taskInput.value = "";
        saveTasks(); // Save tasks to localStorage
    }

    addTaskBtn.addEventListener("click", addTask);
    taskInput.addEventListener("keypress", function (event) {
        if (event.key === "Enter") addTask();
    });

    // Drag and Drop Functionality
    bins.forEach((bin) => {
        bin.addEventListener("dragover", allowDrop);
        bin.addEventListener("drop", drop);
    });

    function dragStart(event) {
        event.dataTransfer.setData("text", event.target.id);
        trashCan.classList.add("visible"); // Show trash can
    }

    function dragEnd(event) {
        trashCan.classList.remove("visible"); // Hide trash can
        const taskId = event.target.id;
        const taskElement = document.getElementById(taskId);
        if (!taskElement) return;

        // Check if task is dropped outside bins
        const isDroppedOutside = !Array.from(bins).some((bin) => bin.contains(taskElement));
        if (isDroppedOutside) {
            taskElement.remove();
            saveTasks(); // Save tasks to localStorage
        }
    }

    function allowDrop(event) {
        event.preventDefault();
    }

    function drop(event) {
        event.preventDefault();
        const taskId = event.dataTransfer.getData("text");
        const taskElement = document.getElementById(taskId);
        if (taskElement) {
            event.target.appendChild(taskElement);
            saveTasks(); // Save tasks to localStorage
        }

        if (event.target.id === "completed") {
            completedAudio.play();
            increaseXP();
        }
    }

    // Trash Can Functionality
    trashCan.addEventListener("dragover", allowDrop);
    trashCan.addEventListener("drop", function (event) {
        event.preventDefault();
        const taskId = event.dataTransfer.getData("text");
        const taskElement = document.getElementById(taskId);
        if (taskElement) {
            taskElement.remove();
            saveTasks(); // Save tasks to localStorage
        }
    });

    function increaseXP() {
        xpPoints += 10;
        console.log(`XP Points: ${xpPoints}`);
    }

    // Save Tasks to Local Storage
    function saveTasks() {
        const tasks = [];
        bins.forEach((bin) => {
            const binTasks = Array.from(bin.querySelectorAll(".sticky-note")).map((task) => ({
                text: task.textContent,
                binId: bin.id,
            }));
            tasks.push(...binTasks);
        });
        localStorage.setItem("tasks", JSON.stringify(tasks));
    }

    // Load Tasks from Local Storage
    function loadTasks() {
        const tasks = JSON.parse(localStorage.getItem("tasks")) || [];
        tasks.forEach((task) => {
            const newTask = document.createElement("div");
            newTask.classList.add("sticky-note");
            newTask.textContent = task.text;
            newTask.draggable = true;
            newTask.setAttribute("id", "task-" + Math.random().toString(36).substr(2, 9));
            newTask.addEventListener("dragstart", dragStart);
            newTask.addEventListener("dragend", dragEnd);
            document.getElementById(task.binId).appendChild(newTask);
        });
    }

    // Breathing Exercise Overlay
    document.getElementById("showBreathing").addEventListener("click", function () {
        document.getElementById("calmOverlay").classList.add("show");
        document.getElementById("breathingAudio").play();
    });

    document.getElementById("closeBreathing").addEventListener("click", function () {
        document.getElementById("calmOverlay").classList.remove("show");
        document.getElementById("breathingAudio").pause();
    });

    // Pomodoro Timer
    let timeLeft;
    let isRunning = false;
    let timer;
    const timerDisplay = document.getElementById("timer-display");
    const pomodoroAudio = document.getElementById("pomodoroAudio");
    const pomodoroWidget = document.getElementById("pomodoroWidget");

    // Modes: Work (53 min) and Break (17 min)
    const WORK_TIME = 3180; // 53 minutes in seconds
    const BREAK_TIME = 1020; // 17 minutes in seconds
    let currentMode = "work"; // Default mode

    // Initialize timer
    resetTimer();

    // Work Mode
    document.getElementById("workMode").addEventListener("click", function () {
        currentMode = "work";
        resetTimer();
        updateActiveButton("workMode");
    });

    // Break Mode
    document.getElementById("breakMode").addEventListener("click", function () {
        currentMode = "break";
        resetTimer();
        updateActiveButton("breakMode");
    });

    // Start Timer
    document.getElementById("startTimer").addEventListener("click", function () {
        if (!isRunning) {
            isRunning = true;
            timer = setInterval(updateTimer, 1000);
            pomodoroAudio.play();
        }
    });

    // Pause Timer
    document.getElementById("pauseTimer").addEventListener("click", function () {
        clearInterval(timer);
        isRunning = false;
    });

    // Reset Timer
    document.getElementById("resetTimer").addEventListener("click", resetTimer);

    // Update Timer Display
    function updateTimer() {
        if (timeLeft > 0) {
            timeLeft--;
            updateTimerDisplay();
        } else {
            clearInterval(timer);
            isRunning = false;
            pomodoroAudio.play();
            alert(`${currentMode === "work" ? "Work" : "Break"} session completed!`);
            resetTimer();
        }
    }

    // Reset Timer
    function resetTimer() {
        clearInterval(timer);
        isRunning = false;
        timeLeft = currentMode === "work" ? WORK_TIME : BREAK_TIME;
        updateTimerDisplay();
    }

    // Update Timer Display
    function updateTimerDisplay() {
        let minutes = Math.floor(timeLeft / 60);
        let seconds = timeLeft % 60;
        timerDisplay.textContent = `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
    }

    // Update Active Button Style
    function updateActiveButton(activeButtonId) {
        document.querySelectorAll(".cute-btn").forEach((button) => {
            button.classList.remove("active");
        });
        document.getElementById(activeButtonId).classList.add("active");
    }

    // Minimize/Expand Pomodoro Timer
    // document.querySelector(".minimize-btn").addEventListener("click", function () {
    //     pomodoroWidget.classList.toggle("minimized");
    // });
    document.querySelector(".minimize-btn").addEventListener("click", function () {
        const pomodoroWidget = document.getElementById("pomodoroWidget");
        const minimizeBtn = document.querySelector(".minimize-btn");
        pomodoroWidget.classList.toggle("minimized");
        pomodoroWidget.classList.toggle("hidden");
        
        // Change button text/icon when minimized or expanded
        if (pomodoroWidget.classList.contains("hidden")) {
            minimizeBtn.innerHTML = "+"; // Plus icon when minimized
        } else {
            minimizeBtn.innerHTML = "-"; // Minus icon when expanded
        }
    });
});