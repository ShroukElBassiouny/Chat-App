const users =[]

const addUser = ({id , username , room})=>{

    //clean the data 
    username = username.trim().toLowerCase()
    room = room.trim().toLowerCase()

    //validate the data
    if(!username || !room){
        return{
            error: "Username and password are required!"
        }
    }

    //check for exsiting user
    const exsitingUser = users.find((user)=>{
        return user.room === room && user.username === username
    })

    //validate username
    if(exsitingUser){
        return{
            error: "Username is in use!"
        }
    }

    //store user 
    const user = {id,username,room}
    users.push(user)
    return{user}
}

const removeUser = (id)=>{
    const index = users.findIndex((user)=> user.id === id)
    if(index !== -1){
        return users.splice(index,1)[0]
    }

}

const getUser = (id)=>{
    const user = users.find((user)=> user.id === id)
    if(!user){
        return{
            error : "User not found"
        }
    }
    return user
    
}

const getAllUsersInRoom = (room)=>{
    room = room.trim().toLowerCase()
    usersRoom = users.filter((user)=> user.room === room)
    if(usersRoom === null){
        return{
            error : "No users found in this room"
        }
    }
    return usersRoom
    }

module.exports={
    addUser,
    removeUser,
    getUser,
    getAllUsersInRoom
}