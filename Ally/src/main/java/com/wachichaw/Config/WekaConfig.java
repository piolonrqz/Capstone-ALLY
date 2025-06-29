package com.wachichaw.Config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.beans.factory.annotation.Value;
import com.google.cloud.storage.Storage;
import com.google.cloud.storage.StorageOptions;
import com.google.cloud.storage.Bucket;
import com.google.cloud.storage.BlobId;
import com.google.cloud.storage.BlobInfo;
import weka.core.Instances;
import weka.core.converters.ConverterUtils.DataSource;
import weka.classifiers.Classifier;
import weka.classifiers.trees.J48;
import weka.classifiers.bayes.NaiveBayes;
import weka.classifiers.functions.SMO;
import java.io.*;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

@Configuration
public class WekaConfig {
    
    // Firebase Storage Configuration
    @Value("${firebase.storage.bucket}")
    private String firebaseBucket;
    
    @Value("${firebase.storage.weka.data.folder:weka/data}")
    private String dataFolder;
    
    @Value("${firebase.storage.weka.models.folder:weka/models}")
    private String modelsFolder;
    
    // Local temp paths for processing
    @Value("${weka.temp.path:#{systemProperties['java.io.tmpdir']}/weka}")
    private String tempPath;
    
    @Value("${weka.use.firebase:true}")
    private boolean useFirebase;
    
    /**
     * Firebase Storage client bean
     */
    @Bean
    public Storage firebaseStorage() {
        return StorageOptions.getDefaultInstance().getService();
    }
    
    /**
     * Bean for Decision Tree classifier (J48)
     * Useful for legal case classification and lawyer recommendation
     */
    @Bean("decisionTreeClassifier")
    public Classifier decisionTreeClassifier() {
        J48 j48 = new J48();
        j48.setUnpruned(false);
        j48.setConfidenceFactor(0.25f);
        j48.setMinNumObj(2);
        return j48;
    }
    
    /**
     * Bean for Naive Bayes classifier
     * Good for text classification and case categorization
     */
    @Bean("naiveBayesClassifier")
    public Classifier naiveBayesClassifier() {
        return new NaiveBayes();
    }
    
    /**
     * Bean for Support Vector Machine classifier
     * Effective for complex pattern recognition in legal cases
     */
    @Bean("svmClassifier")
    public Classifier svmClassifier() {
        SMO smo = new SMO();
        return smo;
    }
    
    /**
     * Creates temp directories for local processing
     */
    @Bean
    public File tempDirectory() {
        File dir = new File(tempPath);
        if (!dir.exists()) {
            dir.mkdirs();
        }
        return dir;
    }
    
    /**
     * Download file from Firebase Storage to local temp
     */
    public File downloadFromFirebase(String firebasePath) throws IOException {
        if (!useFirebase) {
            throw new RuntimeException("Firebase is disabled");
        }
        
        Storage storage = firebaseStorage();
        BlobId blobId = BlobId.of(firebaseBucket, firebasePath);
        
        // Create local temp file
        String fileName = Paths.get(firebasePath).getFileName().toString();
        Path localPath = Paths.get(tempPath, fileName);
        Files.createDirectories(localPath.getParent());
        
        // Download from Firebase
        storage.get(blobId).downloadTo(localPath);
        
        return localPath.toFile();
    }
    
    /**
     * Upload file to Firebase Storage
     */
    public void uploadToFirebase(File localFile, String firebasePath) throws IOException {
        if (!useFirebase) {
            throw new RuntimeException("Firebase is disabled");
        }
        
        Storage storage = firebaseStorage();
        BlobId blobId = BlobId.of(firebaseBucket, firebasePath);
        BlobInfo blobInfo = BlobInfo.newBuilder(blobId)
                .setContentType("application/octet-stream")
                .build();
        
        byte[] fileContent = Files.readAllBytes(localFile.toPath());
        storage.create(blobInfo, fileContent);
    }
    
    /**
     * Load dataset from Firebase Storage or classpath
     */
    public Instances loadDataset(String filename) throws Exception {
        DataSource source;
        
        if (useFirebase) {
            // Download from Firebase Storage
            String firebasePath = dataFolder + "/" + filename;
            File localFile = downloadFromFirebase(firebasePath);
            source = new DataSource(localFile.getAbsolutePath());
        } else {
            // Load from classpath (fallback)
            String resourcePath = "/data/" + filename;
            var inputStream = getClass().getResourceAsStream(resourcePath);
            if (inputStream == null) {
                throw new RuntimeException("Dataset not found: " + resourcePath);
            }
            source = new DataSource(inputStream);
        }
        
        Instances data = source.getDataSet();
        if (data.classIndex() == -1) {
            data.setClassIndex(data.numAttributes() - 1);
        }
        return data;
    }
    
    /**
     * Save trained model to Firebase Storage
     */
    public void saveModel(Classifier model, String modelName) throws Exception {
        // Save to local temp first
        Path localPath = Paths.get(tempPath, modelName + ".model");
        weka.core.SerializationHelper.write(localPath.toString(), model);
        
        if (useFirebase) {
            // Upload to Firebase
            String firebasePath = modelsFolder + "/" + modelName + ".model";
            uploadToFirebase(localPath.toFile(), firebasePath);
        }
    }
    
    /**
     * Load trained model from Firebase Storage
     */
    public Classifier loadModel(String modelName) throws Exception {
        if (useFirebase) {
            // Download from Firebase
            String firebasePath = modelsFolder + "/" + modelName + ".model";
            File localFile = downloadFromFirebase(firebasePath);
            return (Classifier) weka.core.SerializationHelper.read(localFile.getAbsolutePath());
        } else {
            // Load from classpath
            String resourcePath = "/models/" + modelName + ".model";
            var inputStream = getClass().getResourceAsStream(resourcePath);
            if (inputStream == null) {
                throw new RuntimeException("Model not found: " + resourcePath);
            }
            return (Classifier) weka.core.SerializationHelper.read(inputStream);
        }
    }
    
    /**
     * Check if file exists in Firebase Storage
     */
    public boolean fileExistsInFirebase(String firebasePath) {
        if (!useFirebase) return false;
        
        try {
            Storage storage = firebaseStorage();
            BlobId blobId = BlobId.of(firebaseBucket, firebasePath);
            return storage.get(blobId) != null;
        } catch (Exception e) {
            return false;
        }
    }
    
    /**
     * List all datasets in Firebase Storage
     */
    public java.util.List<String> listDatasets() {
        if (!useFirebase) return java.util.Collections.emptyList();
        
        Storage storage = firebaseStorage();
        return storage.list(firebaseBucket, 
                Storage.BlobListOption.prefix(dataFolder + "/"))
                .streamAll()
                .map(blob -> blob.getName().substring(dataFolder.length() + 1))
                .filter(name -> name.endsWith(".arff"))
                .collect(java.util.stream.Collectors.toList());
    }
    
    /**
     * List all models in Firebase Storage
     */
    public java.util.List<String> listModels() {
        if (!useFirebase) return java.util.Collections.emptyList();
        
        Storage storage = firebaseStorage();
        return storage.list(firebaseBucket, 
                Storage.BlobListOption.prefix(modelsFolder + "/"))
                .streamAll()
                .map(blob -> blob.getName().substring(modelsFolder.length() + 1))
                .filter(name -> name.endsWith(".model"))
                .map(name -> name.replace(".model", ""))
                .collect(java.util.stream.Collectors.toList());
    }
}