package mae.iqra;

/**    @author M A Eyler
 * Dec 4, 2015  Started 
 */
import java.io.*;
import java.awt.*;
import java.awt.event.*;
import javax.swing.*;
import javax.swing.tree.*;
import mae.util.Scaler;

public class Bookmarks extends WindowAdapter implements 
             ActionListener, javax.swing.event.TreeSelectionListener {

    final static String FILE   = "iqra.ser";
    final static String BOOK   = "iqra.mark";
    final static String TITLE  = "Konular";
    final static String TOPIC  = "+Konu";
    final static String MARK   = "+Yer";
    final static String RENAME = "Isim";
    final static String REMOVE = "Sil";
    final static String INPUT  = "Yeni konu ismi:";
    final static Font NORMAL = Scaler.scaledFont("Dialog", 0, 13);
    final static Font BOLD   = Scaler.scaledFont("Dialog", 1, 12);
    
    final JFrame frm = new JFrame(TITLE);
    final JPanel pan = new JPanel(new BorderLayout());
    final JPanel but = new JPanel(new GridLayout(1,4)); //4 buttons
    final Iqra3 Q;
    final JTree tree;
    final Node root;
    final NodeManager NM;
    final Object[] 
        DEFAULT = { 1, new Rectangle(0,0,260,440), new Rectangle(260,0,780,674) };
    
    public Bookmarks() {
        Object[] data = NodeManager.retrieveObjects(FILE);
        if (data == null) data = DEFAULT;
        Node nn = NodeManager.loadFrom(BOOK);  //(JTree)data[3];
        root = (nn!=null? nn : new Topic(TITLE));
        DefaultTreeModel model = new DefaultTreeModel(root);  
                               //(DefaultTreeModel)tree.getModel();
        model.setAsksAllowsChildren(true);
        tree = new JTree(model);
        int i = TreeSelectionModel.SINGLE_TREE_SELECTION;
        tree.getSelectionModel().setSelectionMode(i);
        tree.addTreeSelectionListener(this);
        tree.setFont(NORMAL);
        tree.putClientProperty("JTree.lineStyle", "Angled");
        NM = new NodeManager(tree);
        NodeManager.expandAll(tree);
        //root = (Topic)model.getRoot();
        
        System.out.printf("Start with %s leaves %n", root.getLeafCount());
        int x = Scaler.scaledInt(250); int y = Scaler.scaledInt(400);
        pan.setPreferredSize(new Dimension(x, y));
        pan.add(new JScrollPane(tree), BorderLayout.CENTER);
        
        addButton(TOPIC, "Yeni konu ekle"); 
        addButton(RENAME, "Konu adýný deðiþtir");
        addButton(REMOVE, "Konu/iþaret sil");
        addButton(MARK, "Yer iþareti ekle"); 
	pan.add(but, BorderLayout.NORTH);

        frm.setDefaultCloseOperation(JFrame.DISPOSE_ON_CLOSE);
        frm.setBounds((Rectangle)data[1]); //frm.pack(); 
        frm.add(pan);  //Scaler.scaleWindow(frm); 
        frm.setVisible(true);
        frm.addWindowListener(this);
        Q = new Iqra3(); 
        Q.pan.frm.setBounds((Rectangle)data[2]);
        //valueChanged(null);  selected item may not be current page
        Q.gotoPage((Integer)data[0]);
    }
    void addButton(String s, String t) {
        JButton b = new JButton(s);
        b.setFont(BOLD);
        b.setActionCommand(s);
        b.addActionListener(this);
        b.setToolTipText(t);
        but.add(b);
    }

    public void windowClosed(WindowEvent e) {
        NodeManager.saveObjects(FILE, Q.curPage, frm.getBounds(), Q.pan.frm.getBounds());
        NodeManager.saveTo(BOOK, root);
        System.out.printf("JTree saved: %s %s leaves %n", BOOK, root.getLeafCount());
    }
    public void valueChanged(javax.swing.event.TreeSelectionEvent e) {
        Node node = NM.selection();
        if (node == null || node.getAllowsChildren()) return;
        Q.setState(node.object());
        //System.out.println(s+" "+node.isLeaf());
    }
    public void actionPerformed(ActionEvent e) {
        String command = e.getActionCommand();
        Node node = NM.selection();
        if (TOPIC.equals(command)) { //add folder
            if (!(node instanceof Topic)) { beep(); return; }
            String s = JOptionPane.showInputDialog(pan, INPUT);
            if (s == null) return; 
            Node child = new Topic(s);  
            NM.insertInto(child, (Topic)node); 
            NM.select(child);
            System.out.println(command+" "+child);
        } else if (MARK.equals(command)) { //add child
            String s = Q.getState();
            if (node instanceof Mark && ((Mark)node).page == Q.curPage) { 
                NM.setObject(node, s); return; 
            } 
            Node child = new Mark(s); 
            Topic p = node instanceof Topic? (Topic)node : node.parent();
            NM.insertInto(child, p); NM.select(child);
            System.out.println(command+" "+child);
        } else if (RENAME.equals(command)) { //rename
            if (!(node instanceof Topic)) { beep(); return; }
            String s = JOptionPane.showInputDialog(pan, INPUT, node.object());
            if (s == null) return; 
            NM.setObject(node, s);
            System.out.println(command+" "+node);
        } else if (REMOVE.equals(command)) {
            if (!node.isLeaf() || node.parent() == null) { beep(); return; }
            Node x = (Node)node.getPreviousSibling();
            if (x == null) x = (Node)node.getNextSibling();
            if (x == null) x = node.parent(); 
            NM.remove(node); NM.select(x); 
            System.out.println(command+" "+node);
        } else beep();
    }
    
    public static void beep() {
        Toolkit.getDefaultToolkit().beep();
    }
    public static void main(String[] a) {
        new Bookmarks(); 
    }
}
