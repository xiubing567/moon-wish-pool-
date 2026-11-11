const excerpts = [
 ['de','浮士德 · 歌德','Faust · Goethe',26,4,'Verweile doch, du bist so schön!','停一停吧，你真美！','Stay a while, you are so beautiful!'],
 ['en','爱丽丝 · 刘易斯·卡罗尔','Alice · Lewis Carroll',-8,-13,'I wish I hadn’t cried so much!','早知道就不哭那么多了！',''],
 ['tr','尤努斯·埃姆雷','Yunus Emre',43,-41,'Gelin tanış olalım. Sevelim, sevilelim.','来吧，让我们彼此相识，去爱，也被爱。','Come, let us get to know one another. Let us love and be loved.'],
 ['ar','阿布·阿塔希亚','Abu al-Atahiya',-34,18,'فيا ليت الشباب يعود يومًا','但愿青春有一天能回来。','If only youth would return one day.'],
 ['ko','尹东柱 ·《序诗》','Yun Dong-ju · Prologue',6,54,'죽는 날까지 하늘을 우러러 한 점 부끄럼이 없기를','愿我直到死去的那一天，仰望天空也没有一丝羞愧。','May I look up to the sky without a speck of shame until the day I die.'],
 ['fr','波德莱尔','Charles Baudelaire',-44,-44,'N’importe où ! n’importe où ! pourvu que ce soit hors de ce monde !','哪里都行！哪里都行！只要离开这个世界！','Anywhere! Anywhere! As long as it is out of this world!'],
 ['ja','宫泽贤治','Kenji Miyazawa',18,-53,'サウイフモノニ ワタシハナリタイ','我想成为那样的人。','I want to be that kind of person.'],
 ['zh','苏轼 ·《水调歌头》','Su Shi',-17,67,'但愿人长久，千里共婵娟。','','May we live long and share this moon though we are far apart.'],
 ['en','怀特先生 ·《猴爪》','Mr. White · The Monkey’s Paw',-3,115,'I wish for two hundred pounds.','我想要两百英镑。',''],
 ['ar','阿布·卡西姆·沙比','Abu al-Qasim al-Shabbi',23,158,'إذا الشعب يومًا أراد الحياة','如果人民有一天渴望生活。','If one day the people long to live.'],
 ['zh','杜甫 ·《茅屋为秋风所破歌》','Du Fu',-19,-149,'安得广厦千万间，大庇天下寒士俱欢颜！','','If only there were thousands of houses to shelter all the scholars who live in poverty.'],
 ['en','道林·格雷 · 王尔德','Dorian Gray · Oscar Wilde',47,-112,'If it were I who was to be always young, and the picture that was to grow old!','要是我能永远年轻，让画像替我变老就好了！',''],
 ['ja','夜鹰 · 宫泽贤治','The Nighthawk · Kenji Miyazawa',39,39,'どうか私をあなたのところへ連れてって下さい。','求求你，把我带到你那里去吧。','Please, take me to where you are.'],
 ['en','彼得·潘 · 巴里','Peter Pan · J. M. Barrie',-27,-57,'I want always to be a little boy and to have fun.','我想一直当个小男孩，一直玩得开心。',''],
 ['zh','李白','Li Bai',12,-73,'安得倚天剑，跨海斩长鲸。','','If only I had a sword that reached the sky, to cross the sea and strike down the great whale.'],
 ['ja','青年 ·《银河铁道之夜》','The young man · Night on the Galactic Railroad',-23,32,'わたくしはあなた方がいまにそのほんとうの神さまの前に、わたくしたちとお会いになることを祈ります。','我祈愿有一天，你们会在真正的神面前与我们相见。','I pray that someday we will meet before the true God.'],
 ['en','铁皮人 · 鲍姆','The Tin Woodman · L. Frank Baum',54,-15,'I shall take the heart.','我要一颗心。',''],
 ['de','浮士德 · 歌德','Faust · Goethe',-50,42,'Daß ich erkenne, was die Welt im Innersten zusammenhält.','愿我弄懂，在最深处维系世界的是什么。','So that I may know what holds the world together at its core.'],
 ['en','斯克鲁奇 · 狄更斯','Scrooge · Charles Dickens',-16,85,'I should like to have given him something: that’s all.','我真希望当时给了他一点东西。就这样。',''],
 ['en','多萝西 · 鲍姆','Dorothy · L. Frank Baum',34,79,'And I want him to send me back to Kansas.','我想让他送我回堪萨斯。',''],
 ['en','阿拉丁','Aladdin',-37,-125,'Genie, I wish for your freedom.','精灵，我的愿望是让你自由。',''],
 ['en','《三个愿望》','The Three Wishes',63,-157,'I wish the sausages were fast to the tip of your nose.','我希望那几根香肠粘在你鼻尖上。','']
];
export const literaryWishes=excerpts.map(([language,name,englishName,lat,lon,original,zh,en],i)=>({
 id:['T7Q-3MB','G8N-2RX','4DZ-8HT','J3Y-7SL','9FA-6KW','2CN-7UL','K8W-5TX','R4P-9DU','V2Q-8HY','Z6M-4TC','7HD-2NS','B5U-9GR','E4T-8KD','6HX-2QA','P3V-7SF','C9T-4WD','U6M-2KX','Y7J-3BN','A4S-8HZ','M2N-5VE','Q3R-6YT','H8C-4PL'][i],
 language,name,englishName,lat,lon,original,zh,en,literary:true
}));
