# MedFinder(API)

This is tha backend part of MedFinder [Frontend](https://github.com/MdMahdiHasanTazelly/MedFinder_Frontend). This is a course project of Junior Design. 

## Technologies
- Express.JS
- Node.JS
- MongoDB

## API Endpoints
### Doctors
- `GET: /doctors`: To get all doctors information.
- `GET: /doctors/search`: To get doctors information on name based searching.
- `GET: /doctors/:id`: To get a doctor’s details.
- `POST: /doctors`: To add a doctor .
- `GET: /doctors/:id/hospital-detail`:To get a doctor’s chamber information
- `DELETE: /doctors/:id/hospital-detail/:hRegNo`: To delete a doctor’s chamber. 
- `PUT: /doctors/addHReg/:id`: To add a doctor’s cahmber.
- `PUT: /doctors/:id/update`: To update doctor’s information.
- `DELETE: /doctors/:id`: To delete a doctor’s information.
### Admin
- `POST: /admin/login`: For login purpose.
- `POST: /admin/logout`: For logout purpose.
### Hospital
- `GET: /hospitals`: To get all hospitals.
- `GET: /hospitals/search`: To get hospitals information on name based searching.
- `GET: /hospitals/:id`: To get a hospital’s details.
- `POST: /hospitals`: To add a hospital. 
- `DELETE: /hospitals/:id`: To delete a hospital.
- `PUT: /hospitals/:id`: To update a hospital’s information.