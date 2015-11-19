Set objArgs = WScript.Arguments
ZipFile = objArgs(0)
AddCreate = objArgs(1)

' Create empty ZIP file and open for adding
If AddCreate = "new" Then
	CreateObject("Scripting.FileSystemObject").CreateTextFile(ZipFile, True).Write "PK" & Chr(5) & Chr(6) & String(18, vbNullChar)
	WScript.Sleep 100 'REQUIRED!! (Depending on file/dir size)
Else
	Set zip = CreateObject("Shell.Application").NameSpace(ZipFile)
	' Add all files/directories to the .zip file
	For i = 2 To objArgs.count-1
	  zip.CopyHere(objArgs(i))
	  WScript.Sleep 100 'REQUIRED!! (Depending on file/dir size)
	Next
End If

