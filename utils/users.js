const users = [];

const addUser = (user) => {
    if (users.find(usr => usr.username === user.username && usr.room === user.room)) {
        return false;
    }
    users.push(user);
    return true;
}

const removeUser = (id) => {
    const userIndex = users.findIndex((usr) => usr.id == id);
    if (userIndex == -1)
        return {error:'User not found'};
    const removedUser= users.splice(userIndex, 1)[0];
    return {removedUser};
}

const getAllusersInRoom=(room)=>{
    const usersInRoom=users.filter(user=>user.room===room)
    return usersInRoom;
}

const getUser= (userId)=>{
    const usr=users.find((user)=>user.id==userId);
    if(usr)
        return {usr};
    return {error:'Not found'};
}

module.exports = {
    addUser,
    removeUser,
    getAllusersInRoom,
    getUser
};