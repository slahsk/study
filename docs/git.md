```
git clone 경로
```

```
git commit -m "커밋내용"
```

pussh 할때 u옵션 주면 웹에서 로그인창이 나온다.

```
git push origin master
git push u origin master
```




`commit` 시 `git please tell me who you are` 나오면

```
git config user.name "slahsk"
git config user.email "slahsk12@gmail.com"
```
`commit` 시 `filename too long` 나오면

```
git config --system core.longpaths true
```
 
push 시 주소가 다르다고  remoete error 발생시 정상적인 url 주소로 변경해줘야한다.
```
git remote set-url origin 주소
```

local 브런치 삭제

```
git branch -d 브런치이름
```

remote 브런치 삭제 하기
```
git push origin --delete 브런치이름
```

tag 추가하기
```
git tag 3장
```

tag remote 추가
```
git push origin 3장

all
git push --tags
```

tag 삭제
```
git tag -d 3장
```

tag remote 삭제
```
 git push origin :refs/tags/3장
```
