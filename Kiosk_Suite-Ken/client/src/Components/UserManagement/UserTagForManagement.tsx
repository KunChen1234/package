import { io } from "socket.io-client";

// inferface
function UserTag_Management(user: io.UserIdTag) {
    console.log("User tag");
    console.log(user);
    return (
        <div className=" justify-center box-border p-2 min-w-full  bg-tag-back shadow-lg grid grid-flow-2 h-fit border-4 text-center">
            <p>User Information</p>
            <div className="clo-flow-1">
                <img className="inline-block h-20 w-20 rounded-full ring-2 ring-black" src={"http://localhost:9080/" + user.photo} alt="no photo"></img>
            </div>
            <div className="clo-flow-1">

                <p>ID: {user.ID}</p>
                <p>LastName: {user.lastName}</p>
                <p>FirstName: {user.firstName}</p>
                <p>Job: {user.job}</p>
                <p>Department: {user.departmentName}</p>
            </div>
        </div>);
}
export default UserTag_Management;