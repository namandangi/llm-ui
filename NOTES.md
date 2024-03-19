## Build Instructions

#### 1. First the clone the repository locally by

```
    git clone https://github.com/namandangi/gptzero-fs-assessment-2024.git
```

and change directory into the project using

```
    cd ./gptzero-fs-assessment-2024.git
```

#### 2. Install all packages

From the root directory of the project using

```
cd ./frontend
npm install 

cd ../backend
npm install

cd../richeRich
npm install
```

#### 3. Run all the servers

From the root directory of the project using


(Open a new terminal session for each service)
Note: Backend service should be started last
```
cd ./frontend
npm run dev

```
   
```
cd ./richieRich
npm run start
```

```
cd ./backend
npm start
```

##### Additonal Note:

    The client needs to be refreshed after any changes on the backend/ to reconnect the WS session.

### Bugs:

    Currently, the reflected changes on the UI are only visible after you start typing a new prompt
    (The data however, currently gets fetched token by token in real-time, can be inspected in the console of the browser)

Resulting Output: 
![](https://github.com/namandangi/gptzero-fs-assessment-2024/blob/master/static/bug.png)


## UX, Architecture and Scale Considerations

![](https://github.com/namandangi/gptzero-fs-assessment-2024/blob/master/static/arch.jpeg)

    
    UX: Primary UX improvements would definetly include fixing the current UI so the generated text can be updated in real-time. We could also explore offloading the API calls/websocket connection to web workers to unblock the main thread. Also the auto scroll feature felt a bit jiffy and we could improve that to slow down the scroll speed.

    Architecture: I'm still thinking if a 2 way websocket connection is the best way to go or if we could perhaps just get away with long polling. We can also introduce a cache layer like Redis to store client and API sessions and even persist the chat history in a document database, to preserve related context. 

    Scale: My initial thoughts were, 

    1. Are we relying on external services for the LLM/GPT APIs or is it our own in-house service. This could be important becuase we can easily put up a load balancer between the client layers and server layers and call it day if we don't directly manage the API services. However, if we are to also manage it, then we have to probably introduce another load balancer between backend service and the API service. 

    2. Initial ideas around load balancing would be that since the websockets are established over TCP connections, an L4 loadbalancer could handle the balancing and connection management for us between our frontend and backend API services however, it might be a bit tricky to maintain session between the API server and backend service. For example, if the backend service fails before it completly recieves all the token from the API server, how would we handle such a scenario. Since, the richeRich service checks for the done/end token to terminate ws session, we can implement a similar token/checksum mechanism with a retry on the frontend but that feels more like a business decission (SLA/SLO types) right now. With the load balancing mechanism we can guarentee high availability and partition tolerance but consistency still remains questionable due to potential failures. Lastly, for persistence, first thought for scaling would be to seperate the database from the backend into its own service. Furthermore, since we are dealing with a heavier write than read loads, (since a user on average generates way more newer content than accesses of previously generated content) we can further scale the database service by using a master-slave config, where we delegeate write tasks only to the master (maybe a multi master config?) and read tasks to the slaves (eventual consistency seems acceptable here? since we are already caching the latest data).

    (I tried roughly sketching the idea on the diagram above ^^)



Thanks for reading, I'd love to hear your thoughts!