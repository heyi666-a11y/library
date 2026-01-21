@echo off
REM 设置项目目录
set PROJECT_DIR=D:\biancheng\zhengshibanxuexiao

REM 推送到GitHub
git -C "%PROJECT_DIR%" push -u origin master

pause