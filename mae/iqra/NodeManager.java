package mae.iqra;

/**    @author M A Eyler
 * Dec 6, 2015
 */
import java.io.*;
import java.util.ArrayList;
import javax.swing.JTree;
import javax.swing.tree.*;

class NodeManager {

    final JTree tree;
    final DefaultTreeModel model;
    final static String SEP = "\t:";
    
    public NodeManager(JTree t) {
        tree = t; model = (DefaultTreeModel)tree.getModel(); 
    }
    public void remove(Node x) { model.removeNodeFromParent(x); }
    public void insertInto(Node x, Topic p) {
        model.insertNodeInto(x, p, p.getChildCount()); 
    }
    public Node selection() {
        return (Node)tree.getLastSelectedPathComponent();
    }
    public void select(Node x) {
        TreePath p = new TreePath(x.getPath());
        tree.scrollPathToVisible(p);
        tree.setSelectionPath(p);
    }
    public void setObject(Node n, String s) { 
        n.setUserObject(s); model.nodeChanged(n);
    }

    public static void saveTo(String f, TreeNode t) {
        try {
            PrintWriter out = new PrintWriter(f); 
            print(out, t, ""); out.close();
        } catch (IOException e) {
            System.out.println(e.getMessage());
        }
    }
    static void print(PrintWriter out, TreeNode t, String blank) {
        int n = t.getChildCount();
        out.println(blank+t+SEP+n);
        for (int i=0; i<n; i++) {
            TreeNode c = t.getChildAt(i);
            if (c.getAllowsChildren()) //recursive call
                print(out, c, blank+" ");
            else out.println(blank+" "+c);
        }
    }
    public static Node loadFrom(String f) {
        Node t = null;
        try {
            BufferedReader in = new BufferedReader(new FileReader(f)); 
            t = read(in); in.close();
        } catch (IOException e) {
            System.out.println(e.getMessage());
        }return t;
    }
    static Node read(BufferedReader in) throws IOException {
        String[] a = in.readLine().split(SEP);
        String s = a[0];
        int k = 0; while (s.charAt(k) == ' ') k++;
        s = s.substring(k);
        //System.out.println(s+SEP+a.length);
        if (a.length == 1) return new Mark(s);
        Topic t = new Topic(s);
        int n = Integer.parseInt(a[1]);
        for (int i=0; i<n; i++) 
            t.insert(read(in), t.getChildCount()); //recursive call
        return t;
    }
    public static void saveObjects(String f, Serializable... a) {
        try {
            OutputStream os = new FileOutputStream(f);
            ObjectOutput out = new ObjectOutputStream(os); 
            for (Serializable x : a) out.writeObject(x); 
            out.close();
        } catch (IOException e) {
            System.out.println(e.getMessage());
        }
    }
    public static Object[] retrieveObjects(String f) {
        ArrayList<Object> a = new ArrayList<Object>();
        try {
            InputStream is = new FileInputStream(f);
            ObjectInput in = new ObjectInputStream(is);
            while (is.available() > 0) a.add( in.readObject() ); 
            in.close();
            System.out.println(a.size()+" items read");
            return a.toArray();
        } catch (ClassNotFoundException e) {
            System.out.println(e.getMessage()); return null;
        } catch (IOException e) {
            System.out.println(e.getMessage()); return null;
        }
    }
    public static void expandAll(JTree t) {
        TreeNode n = (TreeNode)t.getModel().getRoot();
        expandAll(t, new TreePath(n), n);
    }
    static void expandAll(JTree t, TreePath p, TreeNode n) {
        t.expandPath(p);
        for (int i=0; i<n.getChildCount(); i++) {
           TreeNode c = n.getChildAt(i);
           int k = c.getChildCount();
           if (k>0 && k<10)    //don't expand large nodes
              expandAll(t, p.pathByAddingChild(c), c);
        }
    }
}
    class Node extends DefaultMutableTreeNode {
        Node(String s, boolean a) { super(s, a); }
        public Topic parent() { return (Topic)getParent(); }
        public String object() { return (String)getUserObject(); }
    }
    class Topic extends Node {
        public Topic(String s) { super(s, true); }
    }
    class Mark extends Node {
        int page;
        final static String SPLIT = "p|:|-";
        public Mark(String s) { 
            super(s, false); page = split(s)[0]; 
        }
        public static int[] split(String s) { 
            String[] a = s.split(SPLIT);
            int[] b = new int[3];
            for (int i=0; i<3; i++)
                b[i] = (a.length>i+1? Integer.parseInt(a[i+1]) : 1);
            return b; 
        }
        public static String combine(int p, int i, int j) { 
            if (i == j) return "p"+p;
            return "p"+p+":"+i+"-"+j; 
        }
    }
