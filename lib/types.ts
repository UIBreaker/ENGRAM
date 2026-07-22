export interface Word {
  id: string;
  word: string;
  phonetics: string;
  meaning: string;
  example: string;
  topic: TopicTag;
  difficulty: number; // 0 = new, 1-5
  nextReview: string; // ISO date string
  lastReview: string | null;
  reviewCount: number;
  correctCount: number;
  imageUrl?: string;
  createdAt: string;
}

export type TopicTag =
  | "Công việc"
  | "Lập trình"
  | "Đời sống"
  | "Du lịch"
  | "Học thuật"
  | "Sức khỏe"
  | "Ẩm thực"
  | "Thể thao"
  | "Kinh tế"
  | "Nghệ thuật"
  | "Khoa học"
  | "Môi trường"
  | "Cảm xúc"
  | "Giao tiếp"
  | "Thành ngữ"
  | "Khác";

export const TOPIC_TAGS: TopicTag[] = [
  "Công việc",
  "Lập trình",
  "Đời sống",
  "Du lịch",
  "Học thuật",
  "Sức khỏe",
  "Ẩm thực",
  "Thể thao",
  "Kinh tế",
  "Nghệ thuật",
  "Khoa học",
  "Môi trường",
  "Cảm xúc",
  "Giao tiếp",
  "Thành ngữ",
  "Khác",
];

/** Emoji icon cho từng chủ đề */
export const TOPIC_EMOJI: Record<TopicTag, string> = {
  "Công việc":  "💼",
  "Lập trình":  "💻",
  "Đời sống":   "🏠",
  "Du lịch":    "✈️",
  "Học thuật":  "📚",
  "Sức khỏe":   "🏥",
  "Ẩm thực":    "🍜",
  "Thể thao":   "⚽",
  "Kinh tế":    "📈",
  "Nghệ thuật": "🎨",
  "Khoa học":   "🔬",
  "Môi trường": "🌿",
  "Cảm xúc":    "💭",
  "Giao tiếp":  "💬",
  "Thành ngữ":  "🗣️",
  "Khác":       "🔖",
};

/**
 * Gợi ý chủ đề dựa trên từ/nghĩa người dùng nhập
 * Trả về TopicTag phù hợp nhất hoặc null nếu không chắc
 */
export function suggestTopic(word: string, meaning: string): TopicTag | null {
  const text = `${word} ${meaning}`.toLowerCase();

  const rules: [RegExp, TopicTag][] = [
    // Lập trình
    [/\b(code|program|software|algorithm|function|variable|debug|server|api|database|web|app|tech|data|computer|network|cyber|html|css|javascript|python|java|deploy|cloud|git|loop|array|object|class|method|bug|framework|library|interface|module|component|backend|frontend|fullstack|devops|agile|scrum|sprint|commit|branch|merge)\b/, "Lập trình"],
    // Công việc
    [/\b(work|job|career|office|meeting|manager|employee|salary|project|deadline|team|colleague|boss|hire|resign|promote|presentation|client|contract|report|schedule|business|professional|corporate|department|interview|resume|cv)\b/, "Công việc"],
    // Kinh tế
    [/\b(economy|economic|finance|financial|invest|investment|stock|market|trade|profit|revenue|budget|tax|inflation|gdp|bank|currency|fund|capital|asset|liability|equity|dividend|interest|loan|mortgage|bond|inflation|recession|growth|fiscal|monetary)\b/, "Kinh tế"],
    // Sức khỏe
    [/\b(health|medical|doctor|hospital|disease|symptom|treatment|medicine|drug|surgery|nurse|patient|diagnos|therapy|mental|physical|exercise|diet|nutrition|vitamin|protein|immune|chronic|acute|prescription|pharmacy|clinic|wellness|fitness|yoga|meditation|sick|illness|injury|recovery|vaccine|virus|bacteria|infection|organ|blood|heart|lung|brain|muscle|bone|pain|fever|cold|flu)\b/, "Sức khỏe"],
    // Ẩm thực
    [/\b(food|eat|cook|recipe|cuisine|restaurant|meal|dish|ingredient|flavor|taste|spicy|sweet|sour|bitter|salty|bread|rice|noodle|soup|salad|dessert|breakfast|lunch|dinner|chef|kitchen|bake|grill|fry|boil|steam|vegetable|fruit|meat|seafood|dairy|drink|beverage|coffee|tea|wine|beer|juice|cocktail|nutrition|calorie|diet|organic|fresh|delicious|yummy)\b/, "Ẩm thực"],
    // Du lịch
    [/\b(travel|trip|tour|hotel|flight|airport|visa|passport|destination|tourist|vacation|holiday|adventure|explore|map|guide|ticket|booking|accommodation|hostel|resort|beach|mountain|city|country|culture|landmark|souvenir|luggage|backpack|cruise|jungle|safari|island|border|customs|immigration)\b/, "Du lịch"],
    // Thể thao
    [/\b(sport|game|play|team|player|score|match|competition|champion|tournament|coach|athlete|fitness|run|swim|jump|kick|throw|catch|win|lose|draw|goal|point|referee|stadium|gym|train|exercise|workout|marathon|sprint|cycling|basketball|football|tennis|golf|boxing|wrestling|yoga|pilates)\b/, "Thể thao"],
    // Học thuật
    [/\b(study|academic|university|school|college|research|thesis|dissertation|lecture|professor|student|exam|test|grade|degree|knowledge|theory|hypothesis|experiment|analysis|conclusion|literature|history|philosophy|psychology|sociology|mathematics|physics|chemistry|biology|geography|language|linguistic|education|curriculum|scholarship)\b/, "Học thuật"],
    // Nghệ thuật
    [/\b(art|music|paint|draw|design|create|creative|artist|musician|film|movie|theater|dance|sculpture|photograph|gallery|exhibition|performance|poetry|novel|literature|story|fiction|imagination|aesthetic|beautiful|style|culture|fashion|architecture|photography|illustration|animation|sketch|canvas|color|harmony|rhythm|melody|song|compose)\b/, "Nghệ thuật"],
    // Khoa học
    [/\b(science|scientist|research|discover|experiment|lab|laboratory|theory|hypothesis|evidence|data|result|analysis|publish|peer|review|nature|universe|planet|star|galaxy|atom|molecule|element|compound|reaction|energy|force|gravity|light|wave|quantum|dna|gene|cell|evolution|ecosystem|climate|physics|chemistry|biology|geology|astronomy|neuroscience|cognitive)\b/, "Khoa học"],
    // Môi trường
    [/\b(environment|nature|climate|ecology|ecosystem|pollution|recycle|sustainable|renewable|energy|solar|wind|forest|ocean|sea|river|lake|mountain|wildlife|animal|plant|species|biodiversity|carbon|emission|greenhouse|global warming|ozone|deforestation|conservation|green|organic|eco|natural|resource|habitat|endangered)\b/, "Môi trường"],
    // Cảm xúc
    [/\b(feel|emotion|happy|sad|angry|fear|love|hate|joy|sorrow|grief|anxiety|stress|calm|peace|excitement|bored|lonely|proud|shame|guilt|jealous|envy|hope|despair|trust|courage|confidence|mood|attitude|feeling|sentiment|empathy|compassion|kindness|gratitude|appreciation|satisfaction|frustration|disappointment|relief|nostalgia|melancholy)\b/, "Cảm xúc"],
    // Giao tiếp
    [/\b(communicate|conversation|discuss|argue|debate|explain|describe|express|listen|speak|talk|say|tell|ask|answer|question|respond|reply|message|chat|call|meeting|present|speech|persuade|negotiate|agree|disagree|compromise|feedback|polite|formal|informal|greeting|introduction|farewell|apologize|thank|request|suggest|recommend|advise|warn|interrupt|pause|emphasize)\b/, "Giao tiếp"],
    // Thành ngữ
    [/\b(idiom|phrase|expression|proverb|saying|figurative|metaphor|colloquial|slang|informal|native|speaker|natural|fluent|break a leg|piece of cake|hit the nail|spill the beans|bite the bullet|under the weather|once in a blue moon|cost an arm|kick the bucket|blessing in disguise|let the cat|beat around|dead ringer|back to square|ball is in your court|the ball is|sit on the fence)\b/, "Thành ngữ"],
    // Đời sống
    [/\b(life|daily|home|house|family|friend|person|people|social|society|community|neighbor|local|city|town|street|shop|market|bank|school|park|road|transport|bus|train|car|bicycle|morning|evening|night|routine|habit|hobby|weekend|holiday|celebrate|party|event|culture|tradition|custom|lifestyle|relationship|marriage|child|parent|sibling)\b/, "Đời sống"],
  ];

  for (const [regex, topic] of rules) {
    if (regex.test(text)) return topic;
  }
  return null;
}

export interface JournalEntry {
  id: string;
  date: string;
  content: string;
  aiFeedback: string | null;
  wordCount: number;
}

export interface StudySession {
  id: string;
  date: string; // YYYY-MM-DD
  wordsStudied: number;
  correctCount: number;
}

export type FlashcardRating = "forgot" | "remembered" | "easy";
