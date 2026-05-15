# indexCodeBase

Tai lieu nay tom tat cau truc codebase cua du an `english-work-learning` de dev moi co the nam nhanh app, luong du lieu va vi tri can sua khi phat trien tinh nang.

## Tong quan

`english-work-learning` la ung dung hoc tieng Anh cho nguoi di lam, xay bang Expo, React Native va TypeScript. App dung `expo-router` cho file-based routing, `AsyncStorage` de luu tien do hoc local, va du lieu bai hoc tu `assets/data/lessons.json`.

Chuc nang chinh:

- Onboarding nguoi dung lan dau.
- Kiem tra trinh do va gan level hoc.
- Hoc bai moi ngay theo lo trinh lesson.
- Luyen quiz va danh dau lesson da hoan thanh.
- On tap tu vung bang flashcard.
- Luyen cau hoi thoai cong viec.
- Xem va reset tien do hoc.
- Convert du lieu bai hoc tu Excel sang JSON.

## Stack va lenh chay

Stack chinh:

- Expo `~54`
- React `19`
- React Native `0.81`
- Expo Router `~6`
- TypeScript `~5.9`
- AsyncStorage cho local persistence
- `xlsx` va `ts-node` cho script convert lesson

Lenh thuong dung:

```bash
npm install
npm run start
npm run android
npm run ios
npm run web
npm run lint
npm run convert-lessons -- sample-lessons.xlsx
```

`npm run convert-lessons` doc Excel dau vao va ghi ket qua vao `assets/data/lessons.json`.

## Cau truc thu muc

```text
app/                  Man hinh va route theo expo-router
components/           UI component dung lai trong app
components/ui/        Component UI tu template Expo
constants/            Mau sac, spacing, typography, app constants
data/                 Mock data va index data cu
hooks/                Hook theme va hook doc tien do app
services/             Business service, hien tai tap trung vao lesson
storage/              Lop doc/ghi AsyncStorage
types/                TypeScript types dung chung
utils/                Ham validate du lieu lesson
scripts/              Script Node/TypeScript cho thao tac build data
assets/data/          JSON lesson runtime
assets/images/        App icon, splash, image assets
dist/                 Output build neu co
```

## Entry point va routing

Entry point native/web cua Expo nam trong `package.json`:

```json
"main": "expo-router/entry"
```

Root layout:

- `app/_layout.tsx`
- Cau hinh `ThemeProvider`, `Stack` routes, `StatusBar`.
- Goi `validateLessonsOnStartup()` de validate lesson JSON khi app start.

Routes chinh:

- `app/index.tsx`: man hinh khoi dong, doc progress va redirect.
- `app/onboarding.tsx`: onboarding lan dau, luu `hasCompletedOnboarding`.
- `app/level-test.tsx`: test 5 cau, tinh level va luu ket qua.
- `app/home.tsx`: dashboard hoc tap va dieu huong chinh.
- `app/daily-lesson.tsx`: hoc lesson, quiz, complete lesson.
- `app/lessons.tsx`: danh sach lo trinh va trang thai khoa/mo lesson.
- `app/flashcards.tsx`: on tap tu vung da hoc.
- `app/work-dialogues.tsx`: luyen cau giao tiep tu lesson sentences.
- `app/progress.tsx`: thong ke tien do va tu can on lai.
- `app/settings.tsx`: lam lai level test hoac reset tien do.

Luong redirect ban dau:

```text
app/index.tsx
  -> neu chua onboarding: /onboarding
  -> neu da onboarding nhung chua level test: /level-test
  -> neu da xong ca hai: /home
```

## Domain types

File types trung tam: `types/index.ts`.

Nhom type quan trong:

- `UserLevel`: `basic_review`, `work_communication`, `listening_speaking`.
- `LessonCategory`: `daily_work`, `work_dialogue`, `business_english`.
- `DailyLesson`, `EnglishLesson`: cau truc lesson runtime.
- `DailyLessonWord`, `DailyLessonSentence`, `DailyLessonQuizQuestion`: noi dung lesson.
- `LessonProgress`: lesson da hoc, ngay hien tai, ngay hoc cuoi.
- `WordProgress`, `WordProgressMap`, `WordProgressStatus`: tien do flashcard.
- `AppProgress`: onboarding, level test, level, streak, counters.
- `WorkDialogue`: cau hoi thoai sinh ra tu sentence trong lesson.

Khi them field vao lesson JSON, can cap nhat toi thieu:

- `types/index.ts`
- `utils/validateLessons.ts`
- `scripts/convertLessonsExcelToJson.ts`
- UI screen/component dang render field do

## Du lieu lesson

Runtime data:

- `assets/data/lessons.json`

Service doc data:

- `services/lessonService.ts`

Ham public trong service:

- `validateLessonsOnStartup()`
- `getAllLessons()`
- `getLessonById(id)`
- `getLessonsByCategory(category)`
- `getLessonsByLevel(level)`
- `getNextLesson(currentLessonDay, completedLessonIds)`
- `getAllLessonWords()`
- `getReviewLessonWords(completedLessonIds)`
- `getWorkDialogues()`

`lessonService` load JSON bang `require('../assets/data/lessons.json')`, validate qua `validateLessons`, cache ket qua trong memory, va tra ve ban copy khi can.

## Pipeline Excel sang JSON

Script: `scripts/convertLessonsExcelToJson.ts`.

Input mac dinh:

- `lessons.xlsx`

Trong repo hien co file mau:

- `sample-lessons.xlsx`

Output:

- `assets/data/lessons.json`

Sheet bat buoc:

- `Lessons`
- `Words`
- `Sentences`
- `Grammar`
- `Quiz`

Quan he du lieu:

- `Lessons.id` la khoa chinh cua lesson.
- Cac sheet `Words`, `Sentences`, `Grammar`, `Quiz` lien ket bang cot `lessonId`.
- Sheet `Words` dung cot `english`, `pronunciation`, `meaningVi`, `example`.
- Sheet `Sentences` dung cot `english`, `meaningVi`.
- `Lessons.category` dung mot trong cac gia tri `daily_work`, `work_dialogue`, `business_english`.
- `Grammar.explanationVi` duoc gan vao `grammarTip`.
- `Quiz.correctAnswer` co the la text dap an hoac so thu tu option `1..4`.
- Script van fallback doc cot cu `korean` neu Excel cu chua doi sang `english`, nhung file mau moi dung `english`.

Sau khi build lesson, script goi `validateLessons(lessons, true)` va chi ghi cac lesson hop le vao JSON.

## Storage va tien do hoc

File chinh: `storage/appStorage.ts`.

Backend luu tru: `@react-native-async-storage/async-storage`.

Nhom key dang luu:

- Onboarding va level: `hasCompletedOnboarding`, `hasCompletedLevelTest`, `userLevel`.
- Counters: `streak`, `learnedWordsCount`, `practicedSentencesCount`.
- Lesson progress: `completedLessonIds`, `currentLessonDay`, `lastStudyDate`.
- Flashcard: `wordProgress`.

API chinh:

- `getProgress()`
- `setHasCompletedOnboarding(value)`
- `completeLevelTest(userLevel)`
- `resetLevelTest()`
- `getLessonProgress()`
- `completeLesson(lesson)`
- `getWordProgress()`
- `setWordProgressStatus(wordId, status)`
- `incrementPracticedSentencesCount(amount)`
- `resetProgress()`

Logic quan trong trong `completeLesson(lesson)`:

- Neu lesson chua hoan thanh thi tang streak, learned words va practiced sentences.
- Them word cua lesson vao `wordProgress`.
- Them lesson id vao `completedLessonIds`.
- Cap nhat `currentLessonDay` thanh lesson tiep theo.
- Cap nhat `lastStudyDate`.

## Cac luong chinh

### Onboarding va level test

`app/onboarding.tsx` hien slides gioi thieu va luu flag onboarding. Sau do chuyen sang `app/level-test.tsx`.

`app/level-test.tsx` dung `mockLevelTestQuestions` tu `data/mockLevelTest.ts`, tinh score va map score sang `UserLevel`:

- `0..2`: `basic_review`
- `3..4`: `work_communication`
- `5+`: `listening_speaking`

Ket qua duoc luu bang `appStorage.completeLevelTest`.

### Hoc lesson

`app/daily-lesson.tsx` co the nhan `lessonId` tu route params. Neu khong co, app lay lesson tiep theo bang `getNextLesson`.

Man hinh render:

- Tu vung
- Cau giao tiep
- Grammar tip
- Quiz
- Nut hoan thanh lesson

Nut hoan thanh chi enable sau khi quiz complete. Khi bam, app goi `appStorage.completeLesson(lesson)` roi quay ve `/home`.

### Lo trinh lesson

`app/lessons.tsx` doc tat ca lesson va tien do lesson. Lesson dau tien luon mo khoa. Lesson tiep theo chi mo neu lesson truoc da hoan thanh.

Trang thai UI:

- Da hoc
- Dang hoc
- Bi khoa

### Flashcards

`app/flashcards.tsx` doc `wordProgress`, sap xep tu can on theo uu tien:

```text
forgotten -> unsure -> new -> remembered
```

Moi lan nguoi dung chon `remembered`, `unsure`, hoac `forgotten`, app goi `appStorage.setWordProgressStatus`, tang `reviewCount` va luu `lastReviewedAt`.

### Hoi thoai cong viec

`app/work-dialogues.tsx` khong co data rieng. Man hinh tao hoi thoai tu `lesson.sentences` qua `getWorkDialogues()`.

Khi nguoi dung danh dau da luyen mot cau, app tang `practicedSentencesCount`. Danh sach cau da luyen trong session hien tai duoc giu bang React state, khong persist thanh danh sach rieng.

### Progress va settings

`app/progress.tsx` tong hop:

- Streak
- Level
- Tong tu
- Tong cau da luyen
- So tu theo trang thai flashcard
- Danh sach tu `forgotten` hoac `unsure`

`app/settings.tsx` cho phep:

- Lam lai level test: xoa flag level test va user level.
- Reset toan bo tien do: goi `appStorage.resetProgress()` va quay ve onboarding.

## UI components

Component nen dung khi build man hinh moi:

- `components/AppScreen.tsx`: layout screen co title/subtitle va safe area.
- `components/AppText.tsx`: typography abstraction.
- `components/AppButton.tsx`: button variants.
- `components/AppCard.tsx`: card container.
- `components/ProgressBox.tsx`: o thong ke.
- `components/LessonCard.tsx`: section trong lesson.
- `components/QuizCard.tsx`: quiz renderer.
- `components/Flashcard.tsx`: card on tap tu.
- `components/SpeakButton.tsx`: text-to-speech bang `expo-speech`.
- `components/HomeActionButton.tsx`: action item tren home.

Design tokens:

- `constants/colors.ts`
- `constants/spacing.ts`
- `constants/typography.ts`
- `constants/theme.ts`

Nguyen tac khi them UI:

- Reuse `AppScreen`, `AppText`, `AppButton`, `AppCard` truoc khi tao style rieng.
- Dung color/spacing/radius tu constants de giu UI dong nhat.
- Route moi nen khai bao them screen option trong `app/_layout.tsx`.

## Hooks

Hooks chinh:

- `hooks/use-app-progress.ts`: doc va reload app progress tu storage.
- `hooks/use-color-scheme.ts`: theme system.
- `hooks/use-color-scheme.web.ts`: web-specific color scheme.
- `hooks/use-theme-color.ts`: helper theme color.

Khi can reload data moi lan quay lai screen, codebase dang uu tien `useFocusEffect` tu React Navigation.

## Validation

File validation:

- `utils/validateLessons.ts`

Validation duoc dung o hai noi:

- Startup app qua `validateLessonsOnStartup()`.
- Script convert Excel qua `convertLessonsExcelToJson.ts`.

Muc tieu la tranh crash runtime khi JSON lesson thieu field bat buoc hoac sai shape.

## Huong dan mo rong nhanh

Them lesson moi:

1. Sua file Excel theo cac sheet `Lessons`, `Words`, `Sentences`, `Grammar`, `Quiz`.
2. Chay `npm run convert-lessons -- sample-lessons.xlsx`.
3. Chay app va kiem tra `/lessons`, `/daily-lesson`, `/flashcards`, `/work-dialogues`.

Them man hinh moi:

1. Tao file route trong `app/<route-name>.tsx`.
2. Them `Stack.Screen` trong `app/_layout.tsx` neu can title/header.
3. Reuse `AppScreen` va component trong `components/`.
4. Dieu huong bang `router.push('/route-name')`.

Them field lesson moi:

1. Cap nhat type trong `types/index.ts`.
2. Cap nhat parser Excel trong `scripts/convertLessonsExcelToJson.ts`.
3. Cap nhat validator trong `utils/validateLessons.ts`.
4. Render field trong screen/component can thiet.
5. Chay convert va lint.

Them storage state moi:

1. Them key vao `STORAGE_KEYS` trong `storage/appStorage.ts`.
2. Them default value neu thuoc `AppProgress` hoac progress object.
3. Them get/set method co parse fallback ro rang.
4. Cap nhat screen/hook doc state do.

## Diem can chu y

- README hien van la README mac dinh cua Expo, chua mo ta dung app hien tai.
- Du lieu lesson runtime phu thuoc `assets/data/lessons.json`; neu file rong hoac invalid, nhieu man hinh se hien empty state.
- `lessonService` cache lesson trong memory, nen neu JSON thay doi trong luc app dang chay co the can reload app.
- `work-dialogues` dang sinh tu sentence cua lesson, khong co store rieng cho hoi thoai.
- Flashcard chi co tu sau khi nguoi dung hoan thanh lesson vi `completeLesson` moi them words vao `wordProgress`.
- Progress hien la local-only, chua co backend sync hay auth.
