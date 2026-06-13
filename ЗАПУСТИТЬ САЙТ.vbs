' Дважды кликните ЭТОТ файл (не .bat) — откроется чёрное окно и сайт
Set fso = CreateObject("Scripting.FileSystemObject")
Set shell = CreateObject("WScript.Shell")

dir = fso.GetParentFolderName(WScript.ScriptFullName)
bat = dir & "\ОТКРЫТЬ-САЙТ.bat"

If Not fso.FileExists(bat) Then
  MsgBox "Не найден файл:" & vbCrLf & bat, vbCritical, "Цифровой Агент Х"
  WScript.Quit 1
End If

shell.CurrentDirectory = dir
shell.Run "cmd.exe /k """ & bat & """", 1, False
