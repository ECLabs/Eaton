package digest;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.StringReader;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Map.Entry;

import org.apache.commons.lang3.ArrayUtils;

import opennlp.tools.cmdline.PerformanceMonitor;
import opennlp.tools.cmdline.postag.POSModelLoader;
import opennlp.tools.namefind.NameFinderME;
import opennlp.tools.namefind.TokenNameFinderModel;
import opennlp.tools.postag.POSModel;
import opennlp.tools.postag.POSSample;
import opennlp.tools.postag.POSTaggerME;
import opennlp.tools.sentdetect.SentenceDetectorME;
import opennlp.tools.sentdetect.SentenceModel;
import opennlp.tools.tokenize.Tokenizer;
import opennlp.tools.tokenize.TokenizerME;
import opennlp.tools.tokenize.TokenizerModel;
import opennlp.tools.tokenize.WhitespaceTokenizer;
import opennlp.tools.util.InvalidFormatException;
import opennlp.tools.util.ObjectStream;
import opennlp.tools.util.PlainTextByLineStream;
import opennlp.tools.util.Span;

public class ReadText {
	
	

	public static void SentenceDetect() throws InvalidFormatException, IOException {
		String paragraph = "Hi. How are you? This is Mike.";

		// always start with a model, a model is learned from training data
		InputStream is = new FileInputStream("resources/models/en-sent.bin");
		SentenceModel model = new SentenceModel(is);
		SentenceDetectorME sdetector = new SentenceDetectorME(model);

		String sentences[] = sdetector.sentDetect(paragraph);

		System.out.println(sentences[0]);
		System.out.println(sentences[1]);
		is.close();
	}

	public static void Tokenize() throws InvalidFormatException, IOException {
		InputStream is = new FileInputStream("resources/models/en-token.bin");
		TokenizerModel model = new TokenizerModel(is);
		Tokenizer tokenizer = new TokenizerME(model);
		String tokens[] = tokenizer.tokenize("Hi. How are you? This is Mike.");

		for (String a : tokens)
			System.out.println(a);

		is.close();
	}

	public static void POSTag() throws IOException {
		POSModel model = new POSModelLoader().load(new File("resources/en-pos-perceptron.bin"));
		PerformanceMonitor perfMon = new PerformanceMonitor(System.err, "sent");
		POSTaggerME tagger = new POSTaggerME(model);

		String input = "Hi. How are you? This is Mike.  I am a c++ and Java programmer.  I like to develop enterprise applications.";
		ObjectStream<String> lineStream = new PlainTextByLineStream(new StringReader(input));

		perfMon.start();
		String line;
		while ((line = lineStream.read()) != null) {

			String whitespaceTokenizerLine[] = WhitespaceTokenizer.INSTANCE
					.tokenize(line);
			String[] tags = tagger.tag(whitespaceTokenizerLine);

			POSSample sample = new POSSample(whitespaceTokenizerLine, tags);
			System.out.println(sample.toString());

			perfMon.incrementCounter();
		}
		perfMon.stopAndPrintFinalResult();
	}
	

	public static TokenizerModel tokenizerModel;
	public static POSModel posPerceptronModel;

	static {
		
		try {
			tokenizerModel = new TokenizerModel(new FileInputStream("resources/en-token.bin"));
			posPerceptronModel = new POSModelLoader().load(new File("resources/en-pos-perceptron.bin"));
		} catch (Exception e){
			
		}
	}
		

	public static String[] tokenize(String str) throws InvalidFormatException, IOException {
		Tokenizer tokenizer = new TokenizerME(tokenizerModel);
		String tokens[] = tokenizer.tokenize(str);
		return tokens;
	}

	public static Map<String, Integer> PosTagResume(String fileName) throws IOException {
		
		POSTaggerME tagger = new POSTaggerME(posPerceptronModel);

		File file = new File(fileName);
		BufferedReader reader = null;
		InputStream fis = null;
		Map<String, Integer> tokenMap = new HashMap<String, Integer>();

		try {
			fis = new FileInputStream(file);

			reader = new BufferedReader(new InputStreamReader(fis));

			String line;
			while ((line = reader.readLine()) != null) {

				String whitespaceTokenizerLine[] = WhitespaceTokenizer.INSTANCE
						.tokenize(line);
				String[] tags = tagger.tag(whitespaceTokenizerLine);
				for (int i = 0; i < tags.length; i++) {
					String tag = tags[i];
					String token = whitespaceTokenizerLine[i].replaceAll(
							"[^\\p{L}\\p{Nd}]", "").toLowerCase();
					if ((tag.contains("NN") || tag.contains("JJ"))
							&& !token.equals("")) {
						if (tokenMap.get(token) == null) {
							tokenMap.put(token, 1);
						} else {
							tokenMap.put(token, tokenMap.get(token) + 1);
						}
					}
				}
			}
			return tokenMap;
		} finally {
			if (fis != null) {
				fis.close();
				reader.close();
			}
		}
	}

	public static Map<String, Integer> sortMapByValue(Map<String, Integer> map) {
		List<Entry<String, Integer>> list = new ArrayList<Entry<String, Integer>>(map.entrySet());
		Collections.sort(list, new Comparator<Entry<String, Integer>>() {
			public int compare(Entry<String, Integer> e1,
					Entry<String, Integer> e2) {
				return e2.getValue().compareTo(e1.getValue());
			}
		});
		Map<String, Integer> sorted = new LinkedHashMap<String, Integer>();
		for (Entry<String, Integer> entry : list) {
			sorted.put(entry.getKey(), entry.getValue());
		}
		return sorted;
	}

	public static void printMap(Map<String, Integer> map) {

		for (Map.Entry<String, Integer> pair : map.entrySet()) {
			System.out.println(pair.getKey() + "\t" + pair.getValue());
		}
	}

	public static String[] findTokens(String fileName, TokenNameFinderModel model) throws IOException {

		NameFinderME nameFinder = new NameFinderME(model);

		File file = new File(fileName);
		BufferedReader reader = null;
		InputStream fis = null;
		String[] nameArr = new String[0];
		try {
			fis = new FileInputStream(file);
			reader = new BufferedReader(new InputStreamReader(fis));

			String line;
			while ((line = reader.readLine()) != null) {
				String[] tokenizedLine = tokenize(line);
				Span spansFromLine[] = nameFinder.find(tokenizedLine);
				nameArr = ArrayUtils.addAll(nameArr,
						Span.spansToStrings(spansFromLine, tokenizedLine));
			}
		} finally {
			if (fis != null) {
				fis.close();
				reader.close();
			}
		}

		return nameArr;
	}

	public static String[] findNames(String fileName) throws IOException {
		InputStream is = new FileInputStream("resources/en-ner-person.bin");
		//InputStream is = new FileInputStream("C:/resume-project/resume/name/person.bin");
		TokenNameFinderModel model = new TokenNameFinderModel(is);
		is.close();

		return findTokens(fileName, model);
	}

	public static String[] findOrganizations(String fileName)
			throws IOException {
		InputStream is = new FileInputStream("resources/en-ner-organization.bin");
		TokenNameFinderModel model = new TokenNameFinderModel(is);
		is.close();

		return findTokens(fileName, model);
	}

	public static void findName() throws IOException {
		InputStream is = new FileInputStream("resources/en-ner-organization.bin");

		TokenNameFinderModel model = new TokenNameFinderModel(is);
		is.close();

		NameFinderME nameFinder = new NameFinderME(model);

		String[] sentence = new String[] { "Robert", "Johnson", "is", "a", "good", "person", "in", "The Department of Justice" };

		Span nameSpans[] = nameFinder.find(sentence);

		for (Span s : nameSpans)
			System.out.println(s.toString());
		
		String names[]  = Span.spansToStrings(nameSpans, sentence);
		
		for (String s : names){
			System.out.println(s);
		}
		
	}

	public static void printStringArr(String[] stringArray) {
		for (String str : stringArray) {
			System.out.println(str);
		}
	}

	@SuppressWarnings("unused")
	public static void main(String[] args) {
		Map<String, Integer> map = null;
		try {
			// POS
			// if (false){
			// map = PosTagResume(args[0]);
			// } else {
			// map = PosTagResume("c:/temp/resume.txt");
			// }
			// printMap(sortMapByValue(map));

			// Names and orgs
//			 findName();

			//String[] names = findNames("c:/temp/resume.txt");
			String[] names = findNames("C:/resume-project/resume/name/0bcbe887-ff7b-4405-918d-6e3a64c932be.txt");
			printStringArr(names);
//			String[] orgs = findOrganizations("c:/temp/resume.txt");
//			printStringArr(orgs);

		} catch (InvalidFormatException e) {
			e.printStackTrace();
		} catch (IOException e) {
			e.printStackTrace();
		}
	}

}
