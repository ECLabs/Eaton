package data;

import java.io.File;
import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

import org.apache.commons.lang3.StringUtils;

public class ResumeData {
	
	private Map<String, Map<String, Integer>> personKeywords = null; 
	private Map<String, Map<String, Integer>> keywordPersons = null;
	
	public ResumeData(){
		personKeywords = new HashMap<String, Map<String, Integer>>();
		keywordPersons = new HashMap<String, Map<String, Integer>>();
	}

	public Map<String, Map<String, Integer>> getPersonKeywords() {
		return personKeywords;
	}

	public void setPersonKeywords(Map<String, Map<String, Integer>> personKeywords) {
		this.personKeywords = personKeywords;
	}

	public Map<String, Map<String, Integer>> getKeywordPersons() {
		return keywordPersons;
	}

	public void setKeywordPersons(Map<String, Map<String, Integer>> keywordPersons) {
		this.keywordPersons = keywordPersons;
	}

	public void loadData(String directory) throws IOException{
		File[] files = new File(directory).listFiles();
		NLPMachine nlpm = new NLPMachine();
	    for (File file : files){
	    	if (!file.isDirectory()){
	    		String name = nlpm.findNameDummy(file);
	    		if (StringUtils.isNotBlank(name)){
	    			Map<String, Integer> posTags = nlpm.PosTagResume(file);
	    			personKeywords.put(name, nlpm.sortMapByValue(posTags));
	    		}
	    	}
	    }
	    loadKeywordPersons();
	}
	
	public void loadKeywordPersons(){
		for (Map.Entry<String , Map<String, Integer>> personEntry : personKeywords.entrySet()){
			int count = personEntry.getValue().size() < 10 ? personEntry.getValue().size() : 10;
			for (Map.Entry<String, Integer> posEntry : personEntry.getValue().entrySet()){
				
				if (keywordPersons.get(posEntry.getKey()) == null){
					Map<String, Integer> personWeight = new HashMap<String, Integer>();
					personWeight.put(personEntry.getKey(), posEntry.getValue());
					keywordPersons.put(posEntry.getKey(), personWeight);
				} else {
					keywordPersons.get(posEntry.getKey()).put(personEntry.getKey(), posEntry.getValue());
				}
				if (--count < 1){
					break;
				}
			}
		}
	}
	
	public void printNestedHashMap(Map<String, Map<String, Integer>> map){
		for (Map.Entry<String , Map<String, Integer>> outer : map.entrySet()){
			System.out.println(outer.getKey());
			for (Map.Entry<String, Integer> inner : outer.getValue().entrySet()){
				System.out.println("\t"+inner.getKey()+"\t"+inner.getValue());
			}
		}
	}
	
	public void printPeople(){
		printNestedHashMap(personKeywords);
	}
	
	public void printKeywords(){
		printNestedHashMap(keywordPersons);
	}
	
	public static void main(String args[]){
		ResumeData rd = new ResumeData();
		try {
			rd.loadData("C:/resume-project/resume/text");
			rd.printPeople();
			rd.printKeywords();
		} catch (IOException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
	}
}
