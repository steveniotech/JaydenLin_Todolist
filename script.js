let tasks = {};
let groups = {};
let key = "299315836373";
let deleteConfirm = 0;
let deleting = false;
setInterval(function () {
  deleteConfirm = Math.max(deleteConfirm - 0.1, 0);
  if (deleteConfirm == 0) {
    document.getElementById("deleteAll").innerHTML = "Delete Everything";
  } else {
    document.getElementById(
      "deleteAll"
    ).innerHTML = `Are you sure? ${deleteConfirm.toFixed(2)}`;
  }
}, 100);
document.getElementById("deleteAll").addEventListener("click", () => {
  if (deleteConfirm > 0) {
    tasks = {};
    groups = {};
    deleting = true;
    localStorage.removeItem(key);
    localStorage.removeItem(key + "_group");
    location.reload();
  }
  deleteConfirm = 5;
});
function sortTasks(sortType) {
  if (sortType == "alphabetical") {
    console.log(Object.entries(tasks));
    const sorted = Object.fromEntries(
      Object.entries(tasks).sort((a, b) => a[0].localeCompare(b[0], "en"))
    );
    tasks = sorted;
    location.reload();
  }
  if (sortType == "completion") {
    let completedTasks = {};
    let incompletedTasks = {};
    for (const [key, value] of Object.entries(tasks)) {
      if (value[2] == "complete") {
        completedTasks[key] = Array.from(value);
      } else {
        incompletedTasks[key] = Array.from(value);
      }
    }
    tasks = Object.assign({}, completedTasks, incompletedTasks);
    location.reload();
  }
}
document.getElementById("sortAlphabetical").addEventListener("click", () => {
  sortTasks("alphabetical");
});
document.getElementById("sortCompletion").addEventListener("click", () => {
  sortTasks("completion");
});
function groupExists(groupName) {
  for ([_, value] of Object.entries(groups)) {
    if (value[0] == groupName) {
      return _;
    }
  }
  return null;
}
function makeGroupHTML(groupName, groupDesc, arrKey, isNewGroup) {
  let task = document.createElement("div");
  task.id = arrKey;
  task.className = "group";
  let title = document.createElement("p");
  title.innerText = groupName;
  title.className = "groupTitle";
  let info = document.createElement("p");
  info.innerText = groupDesc;
  info.className = "taskInfo";
  let toggleGroup = document.createElement("button");
  toggleGroup.innerText = "Collapse/Expand";
  let deleteGroup = document.createElement("button");
  deleteGroup.innerText = "Delete Group (and all associated tasks)";
  deleteGroup.addEventListener("click", () => {
    for (let [itemKey, value] of Object.entries(tasks)) {
      delete tasks[itemKey];
    }
    delete groups[arrKey];
    location.reload();
  });
  toggleGroup.addEventListener("click", () => {
    let groupElements = document.getElementsByClassName(
      groupName + "_groupClass"
    );
    for (let item of groupElements) {
      if (item.style.opacity != "0") {
        item.style.opacity = "0";
        setTimeout(() => {
          item.style.display = "none";
        }, 500);
      } else {
        item.style.display = "flex";
        item.style.opacity = "1";
      }
    }
  });
  let taskListHTML = document.getElementById("tasks");
  taskListHTML.insertBefore(task, taskListHTML.firstElementChild);
  task
    .appendChild(title)
    .parentNode.appendChild(info)
    .parentNode.appendChild(toggleGroup)
    .parentNode.appendChild(deleteGroup);
  if (isNewGroup) {
    location.reload();
  }
}
function makeTaskHTML(taskName, desc, arrKey, status, group, isNewTask) {
  let task = document.createElement("div");
  if (document.getElementById(groupExists(group))) {
    document
      .getElementById("tasks")
      .insertBefore(
        task,
        document.getElementById(groupExists(group)).nextSibling
      );
  } else {
    document.getElementById("tasks").appendChild(task);
  }

  task.style.visibility = "visible";
  task.id = arrKey;
  task.className = "task" + " " + group + "_groupClass";
  let title = document.createElement("p");
  title.innerText = taskName + " (Group: " + group + ")";
  title.className = "taskTitle";
  let info = document.createElement("p");
  info.innerText = desc;
  info.className = "taskInfo";
  let taskDelete = document.createElement("button");
  taskDelete.innerHTML = "Delete";
  taskDelete.className = "taskDelete";
  let taskEdit = document.createElement("input");
  taskEdit.placeholder = "insert new description";
  let taskEditTitle = document.createElement("input");
  taskEditTitle.placeholder = "insert new title";
  let applyChanges = document.createElement("button");
  applyChanges.innerHTML = "Apply";
  let taskComplete = document.createElement("button");
  taskComplete.innerHTML = "Complete";
  taskComplete.className = "taskComplete";
  let groupInput = document.createElement("input");
  groupInput.placeholder = "insert group";
  let groupSubmit = document.createElement("button");
  groupSubmit.innerHTML = "Add to group";
  taskDelete.addEventListener("click", () => {
    task.remove();
    if (tasks[arrKey]) {
      delete tasks[arrKey];
    }
  });
  groupSubmit.addEventListener("click", () => {
    if (groupExists(groupInput.value)) {
      tasks[arrKey][3] = groupInput.value;
      title.innerText = taskName + " (Group: " + group + ")";
      location.reload();
    } else {
      alert("Group does not exist! Try creating a group with the same name.");
    }
  });
  taskComplete.addEventListener("click", () => {
    title.style.textDecoration = "line-through";
    if (tasks[arrKey]) {
      tasks[arrKey][2] = "complete";
    }
  });
  applyChanges.addEventListener("click", () => {
    title.innerText = taskName + " (Group: " + group + ")";
    info.innerText = taskEdit.value;
    tasks[arrKey][0] = taskEdit.value;
    tasks[arrKey][1] = taskEditTitle.value;
  });
  if (status == "complete") {
    title.style.textDecoration = "line-through";
  }
  task.appendChild(title);
  task.appendChild(info);
  task.appendChild(taskDelete);
  task.appendChild(taskComplete);
  task.appendChild(taskEditTitle);
  task.appendChild(taskEdit);
  task.appendChild(applyChanges);
  task.appendChild(groupInput);
  task.appendChild(groupSubmit);
  if (isNewTask) {location.reload()};
}
window.onload = function () {
  let data = localStorage.getItem(key);
  let data2 = localStorage.getItem(key + "_group");
  if (!deleting) {
    if (data2 != null) {
      groups = JSON.parse(data2) || {};
      if (groups != null) {
        for (const [k, value] of Object.entries(groups)) {
          makeGroupHTML(value[0], value[1], k, false);
        }
      }
    }
    if (data != null) {
      tasks = JSON.parse(data);
      for (const [k, value] of Object.entries(tasks)) {
        makeTaskHTML(value[0], value[1], k, value[2], value[3],false);
      }
    }
  }
};
window.addEventListener("beforeunload", () => {
  localStorage.setItem(key, JSON.stringify(tasks));
  localStorage.setItem(key + "_group", JSON.stringify(groups));
});
document.getElementById("inputSubmit").addEventListener("click", () => {
  if (
    document.getElementById("inputInfo").value == "" ||
    document.getElementById("inputTitle").value == ""
  ) {
    return;
  }
  for ([_, value] of Object.entries(tasks)) {
    if (document.getElementById("inputTitle").value == value[0]) {
      return;
    }
  }
  let arrKey = new String(Math.random() * Math.random());
  tasks[arrKey] = [
    document.getElementById("inputTitle").value,
    document.getElementById("inputInfo").value,
    "incomplete",
    "Default",
  ];
  makeTaskHTML(
    document.getElementById("inputTitle").value,
    document.getElementById("inputInfo").value,
    arrKey,
    "incomplete",
    "Default",
    true,
  );

});
document.getElementById("toggleComplete").addEventListener("click", () => {
  for ([i, value] of Object.entries(tasks)) {
    if (value[2] == "complete") {
      let item = document.getElementById(i);
      if (item.style.opacity != "0") {
        item.style.opacity = "0";
        setTimeout(() => {
          item.style.display = "none";
        }, 500);
      } else {
        item.style.display = "flex";
        item.style.opacity = "1";
      }
    }
  }
});
document.getElementById("toggleIncomplete").addEventListener("click", () => {
  for ([i, value] of Object.entries(tasks)) {
    if (value[2] == "incomplete") {
      let item = document.getElementById(i);
      if (item.style.opacity != "0") {
        item.style.opacity = "0";
        setTimeout(() => {
          item.style.display = "none";
        }, 500);
      } else {
        item.style.display = "flex";
        item.style.opacity = "1";
      }
    }
  }
});
document.getElementById("showAll").addEventListener("click", () => {
  for ([i, value] of Object.entries(tasks)) {
    document.getElementById(i).style.opacity = "1";
    document.getElementById(i).style.display = "flex";
  }
});
document.getElementById("inputSubmitGroup").addEventListener("click", () => {
  let arrKey = new String(Math.random());
  groups[arrKey] = [
    document.getElementById("groupInputTitle").value,
    document.getElementById("groupInputDescription").value,
  ];  
  makeGroupHTML(
    document.getElementById("groupInputTitle").value,
    document.getElementById("groupInputDescription").value,
    arrKey,
    true
  );
});
