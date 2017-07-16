import Name from './module/Name';
import Message from './module2/Message';



let nameObj = new Name("HJ");
let messageObj = new Message();


console.log(`${nameObj.getName()} ${messageObj.getMessage()}`);

