# VirtualClassroom

## Notes to use the API

Pass the token generated after login into the header with key name **x-access-token**.

### ATK -> x-access-token

### IMPORTANT ------>>>>>>>>>>>>>>>>

PLEASE USE email in username for registration and login apis !!

### IMPORTANT ------>>>>>>>>>>>>>>>>

### ---------------------------------------------------------------------------

### REGISTER AS A Student

POST api
Endpoint: /user/register

Req body

```json
{
	"username": "rastogitanya96@gmail.com",
	"password": "12345"
}
```

### ----------------------------------------------------------------------------

### REGISTER AS A TUTOR

POST api
Endpoint: /user/tutorregister

Req body

```json
{
	"username": "rastogitanya96@gmail.com",
	"password": "12345"
}
```

### --------------------------------------------------------------------------

### LOGIN

POST api
Endpoint: /user/login

Req body

```json
{
	"username": "rastogitanya96@gmail.com",
	"password": "12345"
}
```

### ---------------------------------------------------------------------------

### Create ASSIGNMENT (protected) ONLY FOR TUTOR

### ATK required

POST api
Endpoint: /assignment/create

Req body

```json
{
	"name": "Assignment1",
	"description": "This is an assignment of web programming",
	"publishingDate": "08-24-2021",
	"deadlineDate": "08-28-2021",
	"listOfStudents": [
		{ "studentId": "611f8368682047789425d505" },
		{ "studentId": "611f9082b878c69048554101" }
	]
}
```

### --------------------------------------------------------------------------

### UPDATE ASSIGNMENT (protected) ONLY FOR TUTOR

### ATK required

POST api
Endpoint: /assignment/update

Req body

```json
{
	"description": "Changed the description of the assignment",
	"assignmentId": "6121e9a96ea8137ac069a407"
}
```

#### informs student to whom assignment was assigned via mail

### --------------------------------------------------------------------------

### DELETE ASSIGNMENT (protected) ONLY FOR TUTOR

### ATK required

POST api
Endpoint: /assignment/Delete

Req body

```json
{
	"assignmentId": "6121e9a96ea8137ac069a407"
}
```

### --------------------------------------------------------------------------

### GET ALL ASSIGNMENT LIST

### ATK required

GET api
Endpoint: /assignment/get

Req body
No body required

### NOTES:

#### 1.If user is a student then the all assignments and the status of assignment for that student along with the details of assignment would be displayed.

#### 2. If user is a tutor then all the assignments created by that tutor would be displayed. Assignment id,name and description would be visible. When a tutor will click on any assignment then Get an assignment by totur will run and all the further details regarding an assignment will be shown.

### ---------------------------------------------------------------------------

### GET AN ASSIGNMENT BY TUTOR

### ATK required

GET api
Endpoint: /assignment/tutor

In params
{
Key= assignmentId
Value= 6121e9a96ea8137ac069a407"
}

#### Gives the details of an assignment along with the students and their status,submission and remarks of that assignment.

#### also updates the status of assignment if it has crossed its deadline date

### --------------------------------------------------------------------------

### GET AN ASSIGNMENT BY STUDENT

### ATK required

GET api
Endpoint: /assignment/student

In params
{
Key= assignmentId
Value= 6121e9a96ea8137ac069a407"
}

### Gives the detail of an assignment along with that student's status,remark

### ---------------------------------------------------------------------------

### GET FILTERED ASSIGNMENT BASED ON STATUS

### ATK required

## Only for student

GET api
Endpoint: /assignment/filter

In params
{
Key = status
Value= Pending

}

### NOTES --> Value can be pending, overdue or submitted. If any other value is entered then response will be No assignments found.

### ----------------------------------------------------------------------------

### GIVE REMARK

### ATK required

POST api
Endpoint: /assignment/remark

Req body

```json
{
	"studentId": "6121e8d16ea8137ac069a402",
	"assignmentId": "6121e9a96ea8137ac069a407",
	"remark": "Very good work "
}
```

Only the owner of the assignment can give remark, any other tutor can not do so.
Mail is sent to the student once his assignment has been remarked.

### -----------------------------------------------------------------------------

### SUBMIT ASSIGNMENT

### ATK required

POST API
Endpoint:/assignment/submit

Req body
--Form data
pdfFile = {any pdf here}
assignmentId= 612208c814a8ee4e3883969f

### NOTES: If assignment's deadline is over then student can not submit the assignment , also he can submit only one submission for an assignment
