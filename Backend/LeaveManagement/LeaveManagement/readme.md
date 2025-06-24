# Leave and Attendance Management System

## Sample Roles

``` bash

* Employees  --> * Developer
				 * Tester
                 * Maintenance Engineer
                 * Database Administrator
                 * DevOps Engineers
                 * Network Engineer
* Manager
```


```bash

## Modules

- Attendance
- leave Request
- leave Balance
- shifts
- shiftSwapRequest
- Employee
- Holiday Calendar


```
































``` bash
Emails and Passwords

Emp - 1 - Role: Manager
john.doe@example.com - password1    --  $2a$12$Ks6Z3pOlqY2D2YsQnelEa.QcBQ8vO3hfbTrVdJ2hzUAgiITOSiZNG


Emp - 2 - Role: Manager
jane.smith@example.com - password2   --   $2a$12$x9bx51R8hNIu9QKRxjoc4u.Rnb95i6XopRBvGZKmOh8Gos.MB8diq


Emp - 3 - Role: Developer - Manager - 1
alice.johnson@example.com - password3   --   $2a$12$ZcMzFVHN2o8NeHt2kFie9O2XC3ifKvKKiIQID0Q9QF6dWb1XHXWAq


Emp - 4 - Role: Tester  Manager - 1
bob.brown@example.com - password4     --  $2a$12$Jlvk0ZipMyod0hWbHdwTj.a.LXAoSLHLYK8ks6cqRAP2x9B41QWD2


Emp - 5 - Role: Developer  Manager - 1
charlie.davis@example.com - password5     --  $2a$12$ocLkjPrgrsxpcZP5lSB9Yu55vjnuB6upLMjc8IE3DmwApPktgxf0q


Emp - 6 - Role: Tester  Manager - 2    --   $2a$12$eKPVuVVDN.mF6yiJCI7rJ.xygoO2or.bVYmeD3MMiQDu1F5afkjUq
eve.wilson@example.com - password6


Emp - 7 - Role: Tester  Manager - 2   --   $2a$12$YLUO7lCFz8/xsMgFCVR/J.TYXqL.YwYw/IFMXSO/4Ejbp7fRy1bkm
alex.jones@example.com - password7


Emp - 8 - Role: Developer  Manager - 2   --   $2a$12$ymo5uMDo/cUXDDj7yD6qDez5obz.gzuaklWRCHeJB6.Z3hHhWv2sy
maria.lopez@example.com - password8

Emp - 9 - Role: DevOps Engineer  Manager - 2   --   $2a$12$PpI5NzInKWfO3urdDcWHeO2.JogX5UWZGlC85Dyc7hgx/nE6wnpzG
jack.lol@example.com - password9

Emp - 10 - Role: Network Engineer  Manager - 2   --   $2a$12$iXteU/cK5cKZLYljSTM1We9D5ogfsnuvzxegm8sEA16zOm9vSApNO
elon.mask@example.com - password10

Emp - 11 - Role: Tester  Manager - 1   --  $2a$10$vqkRzhNjtniw3CCpsoet8uxGXxWanZwek.LrKQCyAQLVvkIOkQJO2
jan.doe@example.com - password11



```



```	bash
# Sample usage of the password hashing function using bcrypt
## hashPassword -- This function takes a password as input and returns a hashed version of it using bcrypt.
Bcrypt.hashPassword ("password1",10) -- returns $2a$12$Ks6Z3pOlqY2D2YsQnelEa.QcBQ8vO3hfbTrVdJ2hzUAgiITOSiZNG

## decryptPassword -- This function takes a password and a hashed password as input and returns true if the password matches the hash, otherwise false.
Bcrypt.Verify ("password1", "$2a$12$Ks6Z3pOlqY2D2YsQnelEa.QcBQ8vO3hfbTrVdJ2hzUAgiITOSiZNG") -- returns true
```





















