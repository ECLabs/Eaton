package data;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileInputStream;
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

public class NLPMachine {
	
	
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
	
	public void findName() throws IOException {

		NameFinderME nameFinder = new NameFinderME(nameFinderOrgModel);
		String[] sentence = new String[] { "Robert", "Johnson", "is", "a", "good", "person", "in", "The Department of Justice" };
		Span nameSpans[] = nameFinder.find(sentence);

		for (Span s : nameSpans)
			System.out.println(s.toString());
		
		String names[]  = Span.spansToStrings(nameSpans, sentence);
		
		for (String s : names){
			System.out.println(s);
		}
		
	}

	public static TokenizerModel tokenizerModel;
	public static POSModel posPerceptronModel;
	public static TokenNameFinderModel nameFinderPersonModel;
	public static TokenNameFinderModel nameFinderOrgModel;

	static {
		
		try {
			tokenizerModel = new TokenizerModel(new FileInputStream("resources/en-token.bin"));
			posPerceptronModel = new POSModelLoader().load(new File("resources/en-pos-perceptron.bin"));
			nameFinderPersonModel = new TokenNameFinderModel(new FileInputStream("resources/en-ner-person.bin"));
			//nameFinderPersonModel = new TokenNameFinderModel(new FileInputStream("C:/resume-project/resume/name/person.bin"));
			nameFinderOrgModel = new TokenNameFinderModel(new FileInputStream("resources/en-ner-organization.bin"));

			
		} catch (Exception e){
			
		}
	}
		

	public String[] tokenize(String str) throws InvalidFormatException, IOException {
		Tokenizer tokenizer = new TokenizerME(tokenizerModel);
		String tokens[] = tokenizer.tokenize(str);
		return tokens;
	}

	public Map<String, Integer> PosTagResume(File file) throws IOException {
		
		POSTaggerME tagger = new POSTaggerME(posPerceptronModel);
		BufferedReader reader = null;
		InputStream fis = null;
		Map<String, Integer> tokenMap = new HashMap<String, Integer>();

		try {
			fis = new FileInputStream(file);

			reader = new BufferedReader(new InputStreamReader(fis));

			String line;
			while ((line = reader.readLine()) != null) {

				String whitespaceTokenizerLine[] = WhitespaceTokenizer.INSTANCE.tokenize(line);
				String[] tags = tagger.tag(whitespaceTokenizerLine);
				for (int i = 0; i < tags.length; i++) {
					String tag = tags[i];
					String token = whitespaceTokenizerLine[i].replaceAll("[^\\p{L}\\p{Nd}]", "").toLowerCase();
					if ((tag.contains("NN") || tag.contains("JJ"))&& !token.equals("")) {
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
	
	public List<String> PosTagString(String text) throws IOException {
		
		POSTaggerME tagger = new POSTaggerME(posPerceptronModel);

		String whitespaceTokenizerLine[] = WhitespaceTokenizer.INSTANCE.tokenize(text);
		String[] tags = tagger.tag(whitespaceTokenizerLine);
		List<String> nounsAdjectives = new ArrayList<String>();
		for (int i = 0; i < tags.length; i++) {
			String tag = tags[i];
			String token = whitespaceTokenizerLine[i].replaceAll("[^\\p{L}\\p{Nd}]", "").toLowerCase();
			if ((tag.contains("NN") || tag.contains("JJ"))&& !token.equals("")) {
				nounsAdjectives.add(token);
			}
		}
		return nounsAdjectives;
	}
	 
	
	public Map<String, Integer> PosTagResume(String fileName) throws IOException {
		File file = new File(fileName);
		return PosTagResume(file);
	}

	public Map<String, Integer> sortMapByValue(Map<String, Integer> map) {
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

	public void printMap(Map<String, Integer> map) {

		for (Map.Entry<String, Integer> pair : map.entrySet()) {
			System.out.println(pair.getKey() + "\t" + pair.getValue());
		}
	}

	public String[] findNames(String fileName, TokenNameFinderModel model) throws IOException {

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
				nameArr = ArrayUtils.addAll(nameArr, Span.spansToStrings(spansFromLine, tokenizedLine));
			}
		} finally {
			if (fis != null) {
				fis.close();
				reader.close();
			}
		}

		return nameArr;
	}

	public String[] findPersonNames(String fileName) throws IOException {
		return findNames(fileName, nameFinderPersonModel);
	}

	public String[] findOrganizationNames(String fileName) throws IOException {
		return findNames(fileName, nameFinderOrgModel);
	}

	public void printStringArr(String[] stringArray) {
		for (String str : stringArray) {
			System.out.println(str);
		}
	}
	
	public String findNameDummy(File file) throws IOException{
		BufferedReader reader = null;
		InputStream fis = null;
		try {
			fis = new FileInputStream(file);
			reader = new BufferedReader(new InputStreamReader(fis));

			String line;
			while ((line = reader.readLine()) != null) {
				int startIdx = line.indexOf("<START:person>");
				if (startIdx < 0){
					continue;
				}
				return line.substring(startIdx, line.indexOf("<END>")).replace("<START:person>", "").trim();
			}
		} finally {
			if (fis != null) {
				fis.close();
				reader.close();
			}
		}
		return "";
	}
	
	public String findNameDummy(String fileName) throws IOException{
		File file = new File(fileName);
		return findNameDummy(file);
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

			//String[] names = findPersonNames("c:/temp/resume.txt");
			NLPMachine tf = new NLPMachine();
			//String[] names = tf.findPersonNames("C:/resume-project/resume/text/9c00937c-7368-4ade-b791-9905fb52862f.doc.txt");
		    System.out.println(tf.findNameDummy("C:/resume-project/resume/text/9c00937c-7368-4ade-b791-9905fb52862f.doc.txt"));
			//tf.printStringArr(names);
//			String[] orgs = findOrganizationsNames("c:/temp/resume.txt");
//			printStringArr(orgs);

		} catch (InvalidFormatException e) {
			e.printStackTrace();
		} catch (IOException e) {
			e.printStackTrace();
		}
	}

}
