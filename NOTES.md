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

    
    UX: 

    Architecture:

    Scale